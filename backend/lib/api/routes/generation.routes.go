package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/cache"
	"backend/lib/services/db"
	"backend/lib/services/sess"
	"backend/lib/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/csrf"
	futils "github.com/gofiber/fiber/v2/utils"
)

func RegisterGenerationRoutes(group fiber.Router) {
	generation_group := group.Group("/generate")

	// CSRF Protection
	generation_group.Use(csrf.New(csrf.Config{
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

	generation_group.Use(middlewares.Protected(), middlewares.PayingFeature())

	generation_group.Get("/:file_id", func(c *fiber.Ctx) error {
		var params handlers.GetPDFResumeParams
		if err := c.ParamsParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		return handlers.HandleGetPDFResume(params, c)
	})

	live := generation_group.Group("/live")

	live.Post("/from-cache/:template_name", func(c *fiber.Ctx) error {
		var params handlers.GenerateResumeFromProfileParams
		if err := c.ParamsParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		if !params.Validate() {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		var data handlers.GenerateLiveResumeFromCache
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleGenerateLiveResumeFromCache(params, data, c, &cache.CACHE, &db.DB)
	})

	live.Post("/from-data/:template_name", func(c *fiber.Ctx) error {
		var params handlers.GenerateResumeFromProfileParams
		if err := c.ParamsParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		if !params.Validate() {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		var data handlers.GenerateLiveResumeFromData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleGenerateLiveResumeFromData(params, data, c, &db.DB)
	})

	from_profile := generation_group.Group("/from-profile")

	from_profile.Post("/:template_name", func(c *fiber.Ctx) error {
		var params handlers.GenerateResumeFromProfileParams
		if err := c.ParamsParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		if !params.Validate() {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		return handlers.HandleGenerateResumeFromProfile(params, c, &db.DB)
	})

}
