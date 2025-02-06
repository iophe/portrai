package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/ai"
	"backend/lib/services/cache"
	"backend/lib/services/db"

	"github.com/gofiber/fiber/v2"
)

func RegisterAIRoutes(group fiber.Router) {
	ai_group := group.Group("/ai")
	ai_group.Use(middlewares.Protected())

	session_group := ai_group.Group("/session")

	session_group.Post("/resume", func(c *fiber.Ctx) error {
		var data handlers.BuildResumeData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleBuildResume(data, c, &cache.CACHE, &db.DB, ai.ANTHROPIC)
	})
}
