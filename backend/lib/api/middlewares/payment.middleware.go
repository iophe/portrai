package middlewares

import (
	"backend/lib/services/db"
	"backend/lib/utils"
	"backend/sqlc_gen"
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type PaymentClaims struct {
	jwt.RegisteredClaims
	UserId string `json:"sub"`
}

func PayingFeature() fiber.Handler {
	return func(c *fiber.Ctx) error {
		token_str := c.Cookies("payment_token")
		if token_str == "" {
			user_id, err := GetUserID(c)
			if err != nil {
				return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
					"error": "Unauthorized access",
				})
			}
			token, err := RefreshPaymentToken(user_id, &db.DB)
			if err != nil {
				return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
					"error": "failed to create payment token",
				})
			}
			SetPaymentCookies(c, token)
			return c.Next()
		}

		// Parse and validate the JWT token
		token, err := jwt.ParseWithClaims(token_str, &PaymentClaims{}, func(token *jwt.Token) (interface{}, error) {
			// Verify signing algorithm
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			secret := utils.PAYMENT_SECRET
			if secret == "" {
				return nil, fmt.Errorf("PAYMENT_SECRET not set")
			}
			return []byte(secret), nil
		})

		if err != nil {
			if err == jwt.ErrTokenExpired {
				user_id, err := GetUserID(c)
				if err != nil {
					return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
						"error": "Unauthorized access",
					})
				}
				token, err := RefreshPaymentToken(user_id, &db.DB)
				if err != nil {
					return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
						"error": "failed to create payment token",
					})
				}
				SetPaymentCookies(c, token)

			} else {
				return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
					"error": fmt.Sprintf("invalid token: %v", err),
				})
			}
		}
		if !token.Valid {
			return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
				"error": "invalid token",
			})
		}
		return c.Next()
	}
}

func SetPaymentCookies(c *fiber.Ctx, token string) {
	c.Cookie(&fiber.Cookie{
		Name:     "payment_token",
		Value:    token,
		Expires:  time.Now().Add(1 * time.Hour),
		Secure:   utils.SECURE_COOKIE,
		HTTPOnly: true,
		SameSite: "Strict",
	})
}

func ClearPaymentCookies(c *fiber.Ctx) {
	c.Cookie(&fiber.Cookie{
		Name:     "payment_token",
		Value:    "",
		Expires:  time.Now().Add(-24 * time.Hour),
		Secure:   utils.SECURE_COOKIE,
		HTTPOnly: true,
		SameSite: "Strict",
	})
}
func RefreshPaymentToken(user_id uuid.UUID, DB *db.Database) (string, error) {
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(DB.Pool)
	validity, err := queries.GetPaymentValidity(query_ctx, user_id)
	if err != nil {
		return "", fmt.Errorf("Unauthorized access")
	}
	slog.Info("payment token creation", "validity", validity)
	if time.Now().After(validity.Time) {
		return "", fmt.Errorf("Unauthorized access")
	}
	expiresAt := jwt.NewNumericDate(validity.Time)
	claims := PaymentClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: expiresAt,
		},
		UserId: db.UUIDToString(user_id),
	}
	token_claims := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := token_claims.SignedString([]byte(utils.PAYMENT_SECRET))
	if err != nil {
		slog.Info("payment token creation", "err", err)
		return "", fmt.Errorf("Unauthorized access")
	}
	return token, nil
}
