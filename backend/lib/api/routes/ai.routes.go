package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/ai"
	"backend/lib/services/cache"
	"backend/lib/services/db"
	"backend/lib/services/monitor"
	"backend/lib/services/sess"
	"backend/lib/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/csrf"
	futils "github.com/gofiber/fiber/v2/utils"
)

func RegisterAIRoutes(group fiber.Router) {
	ai_group := group.Group("/ai")

	// Protection complète : auth + CSRF + payment
	ai_group.Use(csrf.New(csrf.Config{
		KeyLookup:         "header:X-Csrf-Token",
		CookieName:        "csrf_",
		CookieSameSite:    "Lax",
		CookieSecure:      utils.SECURE_COOKIE,
		CookieSessionOnly: true,
		KeyGenerator:      futils.UUIDv4,
		Expiration:        1 * time.Hour,
		Session:           sess.SESSIONS,
		SessionKey:        "fiber.csrf.token",
		HandlerContextKey: "fiber.csrf.handler",
	}))
	ai_group.Use(
		middlewares.Protected(),
		middlewares.PayingFeature(),
	)

	session_group := ai_group.Group("/session")

	session_group.Post("/resume", func(c *fiber.Ctx) error {
		var data handlers.BuildResumeData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		// Démarrer le suivi de la génération du CV
		err := monitor.TrackCVGeneration("default", func() error {
			// Appeler la fonction HandleBuildResume existante
			err := handlers.HandleBuildResume(data, c, &cache.CACHE, &db.DB, ai.ANTHROPIC)

			// Si la génération échoue, retourner l'erreur
			if err != nil {
				return err
			}

			// Retourner les résultats du CV généré
			return c.JSON(fiber.Map{
				"message": "Resume generated successfully",
			})
		})

		// Vérifier si le suivi a échoué
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to generate resume",
				"info":  err.Error(),
			})
		}

		return nil
	})
}
