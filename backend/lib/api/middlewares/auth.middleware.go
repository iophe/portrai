package middlewares

import (
	"backend/lib/services/db"
	"backend/lib/utils"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type UserClaims struct {
	jwt.RegisteredClaims
	Email  string `json:"email"`
	Role   string `json:"role"`
	UserId string `json:"sub"`
	Bearer string `json:"bearer"`
}

func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Check for token in Authorization header
		auth_header := c.Get("Authorization")
		var token_str string

		if auth_header != "" {
			parts := strings.Split(auth_header, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				token_str = parts[1]
			}
		}

		// If no token in header, check cookies
		if token_str == "" {
			token_str = c.Cookies("access_token")
		}

		if token_str == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthorized: no token provided",
			})
		}

		// Parse and validate the JWT token
		token, err := jwt.ParseWithClaims(token_str, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
			// Verify signing algorithm
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}

			// Get JWT secret from environment
			secret := utils.JWT_SECRET
			if secret == "" {
				return nil, fmt.Errorf("JWT_SECRET not set")
			}

			return []byte(secret), nil
		})

		if err != nil {
			if err == jwt.ErrTokenExpired {
				// Try to refresh using refresh token
				refresh_token := c.Cookies("refresh_token")
				if refresh_token != "" {
					new_tokens, err := refreshSession(refresh_token)
					if err == nil {
						token_str = new_tokens.AccessToken
						token, err = jwt.ParseWithClaims(token_str, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
							// Verify signing algorithm
							if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
								return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
							}
							// Get JWT secret from environment
							secret := utils.JWT_SECRET
							if secret == "" {
								return nil, fmt.Errorf("JWT_SECRET not set")
							}
							return []byte(secret), nil
						})
						SetAuthCookies(c, new_tokens)
					}
				} else {
					return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
						"error": "token expired",
					})
				}
			} else {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error": fmt.Sprintf("invalid token: %v", err),
				})
			}
		}

		if !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid token",
			})
		}

		// Extract claims
		claims, ok := token.Claims.(*UserClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid token claims",
			})
		}

		// Additional validation
		if claims.ExpiresAt.Unix() < time.Now().Unix() {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "token expired",
			})
		}

		claims.Bearer = token_str
		// Store user info in context
		c.Locals("USER_CLAIMS", *claims)
		return c.Next()
	}
}

// GetUserID helper to get userID from context
func GetUserClaims(c *fiber.Ctx) (UserClaims, error) {
	claims, ok := c.Locals("USER_CLAIMS").(UserClaims)
	if !ok {
		return UserClaims{}, errors.New("user ID not found in context")
	}
	return claims, nil
}

func GetUserID(c *fiber.Ctx) (uuid.UUID, error) {
	claims, ok := c.Locals("USER_CLAIMS").(UserClaims)
	if !ok {
		return uuid.UUID{}, errors.New("user ID not found in context")
	}
	user_id, err := db.StringToUUID(claims.UserId)
	if err != nil {
		return uuid.UUID{}, errors.New("user ID not found in context")
	}
	return user_id, nil
}

func GetUserEmail(c *fiber.Ctx) (string, error) {
	claims, ok := c.Locals("USER_CLAIMS").(UserClaims)
	if !ok {
		return "", errors.New("user ID not found in context")
	}
	return claims.Email, nil
}

type RefreshResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func refreshSession(refresh_token string) (*RefreshResponse, error) {
	data := map[string]string{
		"refresh_token": refresh_token,
	}

	json_data, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	request, err := http.NewRequest("POST",
		fmt.Sprintf("%s/token?grant_type=refresh_token", utils.KONG_AUTH_URL),
		strings.NewReader(string(json_data)))
	if err != nil {
		return nil, err
	}

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("apikey", utils.SERVICE_ROLE_KEY)

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to refresh token")
	}

	var refresh_response RefreshResponse
	if err := json.NewDecoder(response.Body).Decode(&refresh_response); err != nil {
		return nil, err
	}

	return &refresh_response, nil
}

func SetAuthCookies(c *fiber.Ctx, tokens *RefreshResponse) {
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    tokens.AccessToken,
		Expires:  time.Now().Add(1 * time.Hour),
		Secure:   true,
		HTTPOnly: true,
		SameSite: "Strict",
	})

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    tokens.RefreshToken,
		Expires:  time.Now().Add(30 * 24 * time.Hour), // 30 days
		Secure:   true,
		HTTPOnly: true,
		SameSite: "Strict",
	})
}
