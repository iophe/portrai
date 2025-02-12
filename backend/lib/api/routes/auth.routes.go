package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"log/slog"

	"github.com/gofiber/fiber/v2"
)

func RegisterAuthRoutes(group fiber.Router) {
	auth_group := group.Group("/auth")

	auth_group.Post("/signup/email",
		func(c *fiber.Ctx) error {
			var data handlers.EmailSignupData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			res, err := handlers.HandleEmailSignup(c, data)
			if err != nil {
				slog.Error("signup failed", "err", err)
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": err.Error(),
				})
			}
			return c.Status(fiber.StatusOK).JSON(res)
		},
	)

	auth_group.Post("/signin/email",
		func(c *fiber.Ctx) error {
			var data handlers.EmailSigninData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			res, err := handlers.HandleEmailSignin(c, data)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": err,
				})
			}
			return c.Status(fiber.StatusOK).JSON(res)
		},
	)

	// Protected routes (auth + CSRF)
	protected_routes := auth_group.Group("")
	protected_routes.Use(
		middlewares.Protected(),
		middlewares.CSRFMiddleware(middlewares.CSRFConfig{
			ExemptRoutes: []string{"/api/auth/signin/email", "/api/auth/signup/email"},
		}),
	)

	protected_routes.Get("/check", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	protected_routes.Post("/logout", func(c *fiber.Ctx) error {
		return handlers.HandleLogout(c)
	})

	protected_routes.Post("/delete", func(c *fiber.Ctx) error {
		return handlers.HandleDeleteAccount(c)
	})

	// CSRF token endpoint
	protected_routes.Get("/api/csrf-token", middlewares.GenerateCSRFToken)
}
