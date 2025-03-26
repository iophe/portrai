package routes

import (
	"backend/lib/services/monitor"
	"backend/lib/services/sess"
	"backend/lib/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/csrf"
	futils "github.com/gofiber/fiber/v2/utils"
)

func RegisterRoutes(server *fiber.App) {
	monitor.RegisterMonitoringRoutes(server)

	api_group := server.Group("/api")

	v1_group := api_group.Group("/v1")

	RegisterAuthRoutes(v1_group)
	RegisterPaymentRoutes(v1_group)
	RegisterResumeRoutes(v1_group)
	RegisterAIRoutes(v1_group)
	RegisterAccountRoutes(v1_group)
	RegisterMailRoutes(v1_group)
	RegisterTemplateRoutes(v1_group)

	v1_group.Get("/ping",
		func(c *fiber.Ctx) error {

			return c.SendStatus(fiber.StatusOK)
		},
	)

	csrf_group := v1_group.Group("/csrf")

	csrf_group.Use(csrf.New(csrf.Config{
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

	csrf_group.Get("/update", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})
}
