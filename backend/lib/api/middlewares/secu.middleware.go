package middlewares

import (
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// CSRFConfig allows configuring CSRF exempt routes
type CSRFConfig struct {
	ExemptRoutes []string
}

// CSRFMiddleware protects against CSRF attacks
func CSRFMiddleware(config CSRFConfig) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Skip CSRF for exempt routes
		if isCSRFExempt(c.Path(), config.ExemptRoutes) {
			return c.Next()
		}

		// Check CSRF only for state-changing methods
		if isStateChangingMethod(c.Method()) {
			slog.Info("verif csrf")

			if err := validateCSRF(c); err != nil {
				return c.Status(403).JSON(fiber.Map{
					"error": "Invalid CSRF token",
				})
			}
		}

		return c.Next()
	}
}

// GenerateCSRFToken creates a new CSRF token
func GenerateCSRFToken(c *fiber.Ctx) error {
	token := generateSecureHash()
	slog.Info("token csrf généré")
	c.Cookie(&fiber.Cookie{
		Name:     "csrf_token",
		Value:    token,
		Expires:  time.Now().Add(24 * time.Hour),
		SameSite: "Strict",
	})

	return c.JSON(fiber.Map{
		"csrf_token": token,
	})
}

// Helper functions
func validateCSRF(c *fiber.Ctx) error {
	headerToken := c.Get("X-CSRF-Token")
	cookieToken := c.Cookies("csrf_token")
	if headerToken == "" || cookieToken == "" || headerToken != cookieToken {
		slog.Info("token valide pas")

		return fmt.Errorf("invalid CSRF token")
	}

	return nil
}

// isStateChangingMethod checks if HTTP method modifies server state
func isStateChangingMethod(method string) bool {
	switch method {
	case "POST", "PUT", "DELETE", "PATCH":
		// These HTTP methods modify server state
		return true
	default:
		// GET, HEAD, OPTIONS don't modify state
		return false
	}
}

// isCSRFExempt checks if path is exempt from CSRF protection
func isCSRFExempt(path string, exemptRoutes []string) bool {
	// Common exempt routes:
	if path == "/api/webhook" || // External webhooks (Stripe, etc.)
		strings.HasPrefix(path, "/api/auth/") || // Authentication routes
		strings.HasPrefix(path, "/api/public/") { // Public API
		return true
	}

	// Check if path is in exempt routes list
	for _, route := range exemptRoutes {
		if strings.HasPrefix(path, route) {
			return true
		}
	}

	return false
}
