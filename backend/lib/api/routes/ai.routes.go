package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/ai"
	"backend/lib/services/cache"
	"backend/lib/services/db"
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

	session_group := ai_group.Group("/conversation")

	session_group.Post("/start", func(c *fiber.Ctx) error {
		var data handlers.StartConversationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleStartConversation(data, c, &cache.CACHE, &db.DB, &ai.ANTHROPIC)
	})

	session_group.Get("/metadata/:conversation_id", func(c *fiber.Ctx) error {
		var params handlers.GetMetadataParams
		if err := c.ParamsParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request params",
			})
		}
		return handlers.HandleGetMetadata(params, c, &cache.CACHE)
	})

	session_group.Post("/comment/resume/:conversation_id", func(c *fiber.Ctx) error {
		var params handlers.CommentResumeParams
		if err := c.ParamsParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request params",
			})
		}
		var data handlers.CommentResumeData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleCommentResume(params, data, c, &cache.CACHE, &db.DB, &ai.ANTHROPIC)
	})
	session_group.Post("/comment/letter/:conversation_id", func(c *fiber.Ctx) error {
		var params handlers.CommentCoverLetterParams
		if err := c.ParamsParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request params",
			})
		}
		var data handlers.CommentCoverLetterData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleCommentCoverLetter(params, data, c, &cache.CACHE, &db.DB, &ai.ANTHROPIC)
	})
	session_group.Post("/letter/:conversation_id", func(c *fiber.Ctx) error {
		var params handlers.CreateCoverLetterParams
		if err := c.ParamsParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request params",
			})
		}
		var data handlers.CreateCoverLetterData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleCreateCoverLetter(params, data, c, &cache.CACHE, &db.DB, &ai.ANTHROPIC)
	})

	session_group.Post("/resume/:conversation_id", func(c *fiber.Ctx) error {
		var params handlers.CreateResumeParams
		if err := c.ParamsParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request params",
			})
		}
		var data handlers.CreateResumeData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleCreateResume(params, data, c, &cache.CACHE, &db.DB, &ai.ANTHROPIC)
	})
}
