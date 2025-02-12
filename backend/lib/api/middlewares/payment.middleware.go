package middlewares

import (
	database "backend/lib/services/db"
	"backend/lib/utils"
	"backend/sqlc_gen"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func PaymentAuthMiddleware(db *database.Database) fiber.Handler {
	return func(c *fiber.Ctx) error {

		// 1. Vérifier le token de paiement principal
		paymentToken := c.Cookies("payment_status")

		// Si le token existe, vérifier sa validité
		if paymentToken != "" {
			// Vérifier la validité du token
			if isValidPaymentToken(paymentToken) {
				return c.Next()
			}
		}

		slog.Info("on est la etape refreshS")

		// 2. Vérifier le refresh token
		refreshToken := c.Cookies("payment_refresh")
		if refreshToken != "" {
			// Vérifier la validité du refresh token
			if isValidPaymentRefreshToken(refreshToken) {
				// Générer de nouveaux tokens
				newPaymentToken := generatePaymentToken(24 * time.Hour)
				newRefreshToken := generatePaymentRefreshToken()

				// Mettre à jour les cookies
				c.Cookie(&fiber.Cookie{
					Name:     "payment_status",
					Value:    newPaymentToken,
					Expires:  time.Now().Add(24 * time.Hour),
					HTTPOnly: true,
					Secure:   true,
					SameSite: fiber.CookieSameSiteStrictMode,
				})

				c.Cookie(&fiber.Cookie{
					Name:     "payment_refresh",
					Value:    newRefreshToken,
					Expires:  time.Now().Add(365 * 24 * time.Hour),
					HTTPOnly: true,
					Secure:   true,
					SameSite: fiber.CookieSameSiteStrictMode,
				})

				return c.Next()
			}
		}

		slog.Info("on est la etape verif bdd ")

		// 3. Vérifier le statut de paiement en base de données
		userID, err := GetUserID(c)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authentication required",
			})
		}

		queries := sqlc_gen.New(db.Pool)

		paymentStatus, err := getPaymentStatus(c, queries, userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Error checking payment status",
			})
		}

		// Si paiement valide, créer de nouveaux tokens
		if paymentStatus.HasValidPlan {

			newPaymentToken := generatePaymentToken(24 * time.Hour)
			newRefreshToken := generatePaymentRefreshToken()

			c.Cookie(&fiber.Cookie{
				Name:     "payment_status",
				Value:    newPaymentToken,
				Expires:  time.Now().Add(24 * time.Hour),
				HTTPOnly: true,
				Secure:   true,
				SameSite: fiber.CookieSameSiteStrictMode,
			})

			c.Cookie(&fiber.Cookie{
				Name:     "payment_refresh",
				Value:    newRefreshToken,
				Expires:  time.Now().Add(365 * 24 * time.Hour),
				HTTPOnly: true,
				Secure:   true,
				SameSite: fiber.CookieSameSiteStrictMode,
			})

			return c.Next()
		}

		// Pas de paiement valide
		return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
			"error": "Payment required",
		})
	}
}

// Modification de isValidPaymentRefreshToken
func isValidPaymentRefreshToken(tokenString string) bool {
	// Vérifier la signature et l'expiration
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(utils.JWT_SECRET), nil
	})

	if err != nil {
		return false
	}

	// Vérifier les claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Vérifier que c'est un refresh token
		if tokenType, ok := claims["type"].(string); !ok || tokenType != "refresh" {
			return false
		}

		// Vérifier le statut de paiement
		if paid, ok := claims["paid"].(bool); !ok || !paid {
			return false
		}

		// Vérifier l'expiration
		if exp, ok := claims["exp"].(float64); ok {
			return time.Now().Unix() < int64(exp)
		}
	}

	return false
}

// getPaymentStatus vérifie le statut de paiement en base de données
func getPaymentStatus(c *fiber.Ctx, queries *sqlc_gen.Queries, userID uuid.UUID) (PaymentStatus, error) {
	ctx := c.Context()

	// Récupérer le dernier paiement valide
	payment, err := queries.GetLatestPaymentByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return PaymentStatus{
				HasValidPlan: false,
				ExpiresAt:    time.Time{},
			}, nil
		}
		return PaymentStatus{}, fmt.Errorf("error checking payment status: %w", err)
	}

	// Vérifier si le paiement est encore valide
	expirationDate := payment.Created.Time.AddDate(0, 3, 0) // Ajoute 3 mois
	isValid := payment.Status.PaymentStatus == "completed" &&
		expirationDate.After(time.Now())

	return PaymentStatus{
		HasValidPlan: isValid,
		ExpiresAt:    expirationDate,
	}, nil
}

// Structure pour le statut de paiement
type PaymentStatus struct {
	HasValidPlan bool
	ExpiresAt    time.Time
}

// getUserIDFromRefreshToken extrait l'ID utilisateur d'un refresh token
func getUserIDFromRefreshToken(tokenString string) (uuid.UUID, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(utils.JWT_SECRET), nil
	})

	if err != nil {
		return uuid.Nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if userIDStr, ok := claims["user_id"].(string); ok {
			return uuid.Parse(userIDStr)
		}
	}

	return uuid.Nil, errors.New("unable to extract user ID from token")
}

// isValidPaymentToken validates a payment JWT token
// Checks signature, expiration and paid status
func isValidPaymentToken(tokenString string) bool {
	if tokenString == "" {
		return false
	}

	// Parse token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(utils.JWT_SECRET), nil
	})

	if err != nil {
		return false
	}

	// Verify claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Check paid status
		if paid, ok := claims["paid"].(bool); !ok || !paid {
			return false
		}

		// Check expiration
		if exp, ok := claims["exp"].(float64); ok {
			return time.Now().Unix() < int64(exp)
		}
	}

	return false
}

// generateSecureHash creates a cryptographically secure random hash
// Used to track token renewals
func generateSecureHash() string {
	// Generate 32 random bytes
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return ""
	}

	// Convert to URL-safe base64
	hash := base64.URLEncoding.EncodeToString(bytes)

	// Add prefix to identify hash type
	return fmt.Sprintf("pay_%s", hash)
}

// generatePaymentToken creates a new JWT token with payment claims
// Includes paid status, expiration and secure hash
func generatePaymentToken(duration time.Duration) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"paid": true,
		"exp":  time.Now().Add(duration).Unix(),
		"hash": generateSecureHash(), // Track renewals
	})

	signedToken, _ := token.SignedString([]byte(utils.JWT_SECRET))
	return signedToken
}

// When setting up refresh token initially, you would use:
func generatePaymentRefreshToken() string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"paid": true,
		"type": "refresh",
		"exp":  time.Now().Add(365 * 24 * time.Hour).Unix(), // 1 year
		"hash": generateSecureHash(),
	})

	signedToken, _ := token.SignedString([]byte(utils.JWT_SECRET))
	return signedToken
}
