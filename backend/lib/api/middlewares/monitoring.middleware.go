package middlewares

import (
	"backend/lib/services/monitor"

	"github.com/gofiber/fiber/v2"
)

// Middleware qui utilise TrackCVGeneration pour les routes de génération de CV
func CVGenerationMiddleware(templateType string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// On utilise TrackCVGeneration pour envelopper l'exécution de la route
		return monitor.TrackCVGeneration(templateType, func() error {
			// Exécuter le handler normal de la route
			return c.Next()
		})
	}
}
