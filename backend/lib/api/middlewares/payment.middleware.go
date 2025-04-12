package middlewares

import (
	"backend/lib/services/db"
	"backend/lib/utils"
	"backend/sqlc_gen"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type PayingFeatures string

const (
	RESUME_GENERATION       PayingFeatures = "RESUME_GENERATION"
	COVER_LETTER_GENERATION PayingFeatures = "COVER_LETTER_GENERATION"
	RESUME_VERSIONING       PayingFeatures = "RESUME_VERSIONING"
)

const ACTIVE_ACCOUNT_TOKEN = "active_token"

type PaymentClaims struct {
	jwt.RegisteredClaims
	UserId  string         `json:"sub"`
	Feature PayingFeatures `json:"feature"`
	Current int            `json:"current"`
	Limit   int            `json:"limite"`
}

func (feature PayingFeatures) Token() string {
	switch feature {
	case RESUME_GENERATION:
		return "ai_resume_token"
	case COVER_LETTER_GENERATION:
		return "ai_letter_token"
	case RESUME_VERSIONING:
		return "resume_token"
	}
	return "payment_token"
}

func ActiveAccount() fiber.Handler {
	return func(c *fiber.Ctx) error {
		token_str := c.Cookies(ACTIVE_ACCOUNT_TOKEN)
		if token_str == "" {
			user_id, err := GetUserID(c)
			if err != nil {
				return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
					"error":   "Unauthorized access",
					"details": err.Error(),
				})
			}
			token, err := RefreshActiveAccountToken(user_id, &db.DB)
			if err != nil {
				return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
					"error":   "failed to create payment token",
					"details": err.Error(),
				})
			}
			SetActiveAccountCookies(c, token)
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
						"error":   "Unauthorized access",
						"details": err.Error(),
					})
				}
				token, err := RefreshActiveAccountToken(user_id, &db.DB)
				if err != nil {
					return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
						"error":   "failed to create payment token",
						"details": err.Error(),
					})
				}
				SetActiveAccountCookies(c, token)

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
		// Extract claims
		claims, ok := token.Claims.(*PaymentClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid token claims",
			})
		}
		if time.Now().After(claims.ExpiresAt.Time) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized access",
				"details": "expiration",
			})
		}
		return c.Next()
	}
}

func PayingFeature(feature PayingFeatures, db *db.Database) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user_id, err := GetUserID(c)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized access",
				"details": err.Error(),
			})
		}
		err = CheckFeatureUsageValidity(user_id, feature, db)
		if err != nil {
			return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
				"error":   "Unauthorized access",
				"details": err.Error(),
			})
		}
		return c.Next()
	}
}

func SetActiveAccountCookies(c *fiber.Ctx, token string) {
	c.Cookie(&fiber.Cookie{
		Name:     ACTIVE_ACCOUNT_TOKEN,
		Value:    token,
		Expires:  time.Now().Add(1 * time.Hour),
		Secure:   utils.SECURE_COOKIE,
		HTTPOnly: true,
		SameSite: "Strict",
	})
}

func ClearActiveAccountCookies(c *fiber.Ctx) {
	c.Cookie(&fiber.Cookie{
		Name:     ACTIVE_ACCOUNT_TOKEN,
		Value:    "",
		Expires:  time.Now().Add(-24 * time.Hour),
		Secure:   utils.SECURE_COOKIE,
		HTTPOnly: true,
		SameSite: "Strict",
	})
}

func RefreshActiveAccountToken(user_id uuid.UUID, DB *db.Database) (string, error) {
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(DB.Pool)
	validity, err := queries.GetPaymentValidity(query_ctx, user_id)
	if err != nil {
		return "", fmt.Errorf("Unauthorized access")
	}

	if time.Now().After(validity.ExpiredAt.Time) {
		return "", fmt.Errorf("Unauthorized access")
	}

	expiresAt := jwt.NewNumericDate(validity.ExpiredAt.Time)
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

func CheckFeatureUsageValidity(user_id uuid.UUID, feature PayingFeatures, DB *db.Database) error {
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(DB.Pool)
	validity, err := queries.GetPaymentValidity(query_ctx, user_id)
	if err != nil {
		return fmt.Errorf("Unauthorized access")
	}

	if time.Now().After(validity.ExpiredAt.Time) {
		return fmt.Errorf("Unauthorized access")
	}

	var usage map[string]any
	if err := json.Unmarshal(validity.Usage, &usage); err != nil {
		return fmt.Errorf("error parsing usage data: %w", err)
	}

	feature_usage, ok := usage[string(feature)].(map[string]any)
	if !ok {
		return fmt.Errorf("invalid usage data format")
	}

	current, ok := feature_usage["current"]
	if !ok {
		return fmt.Errorf("missing current usage data")
	}

	limit, ok := feature_usage["limit"]
	if !ok {
		return fmt.Errorf("missing maximum usage data")
	}

	var current_val, limit_val float64

	switch v := current.(type) {
	case float64:
		current_val = v
	case int:
		current_val = float64(v)
	default:
		return fmt.Errorf("invalid current usage value type")
	}

	switch v := limit.(type) {
	case float64:
		limit_val = v
	case int:
		limit_val = float64(v)
	default:
		return fmt.Errorf("invalid maximum usage value type")
	}

	if current_val >= limit_val {
		return fmt.Errorf("usage limit exceeded")
	}

	return nil
}

func IncrementUsage(c *fiber.Ctx, user_id uuid.UUID, feature PayingFeatures, DB *db.Database) error {
	queries := sqlc_gen.New(DB.Pool)
	switch feature {
	case RESUME_GENERATION:
		queries.IncrementResumeGenerationUsage(c.Context(), user_id)
	case COVER_LETTER_GENERATION:
		queries.IncrementCoverLetterGenerationUsage(c.Context(), user_id)
	case RESUME_VERSIONING:
		queries.IncrementResumeVersioningUsage(c.Context(), user_id)

	}
	return nil
}

func DecrementUsage(c *fiber.Ctx, user_id uuid.UUID, feature PayingFeatures, DB *db.Database) error {
	queries := sqlc_gen.New(DB.Pool)
	switch feature {
	case RESUME_VERSIONING:
		queries.DecrementResumeVersioningUsage(c.Context(), user_id)
	}
	return nil
}
