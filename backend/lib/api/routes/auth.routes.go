package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
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
			res, err := handlers.HandleEmailSignup(c, data, &db.DB)
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

	auth_group.Get("/check",
		middlewares.Protected(),
		func(c *fiber.Ctx) error {
			return c.SendStatus(fiber.StatusOK)
		})

	auth_group.Post("/logout",
		middlewares.Protected(),
		func(c *fiber.Ctx) error {
			return handlers.HandleLogout(c)
		})

	auth_group.Post("/delete",
		middlewares.Protected(),
		func(c *fiber.Ctx) error {
			return handlers.HandleDeleteAccount(c)
		})
}
