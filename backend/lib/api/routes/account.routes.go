package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/db"

	"github.com/gofiber/fiber/v2"
)

func RegisterAccountRoutes(group fiber.Router) {
	// Account Routes
	account_group := group.Group("/account")
	account_group.Use(middlewares.Protected())

	account_group.Get("/user", func(c *fiber.Ctx) error {
		return handlers.HandleGetUser(c, &db.DB)
	})

	account_group.Post("/user/update", func(c *fiber.Ctx) error {
		var data handlers.UserUpdateData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleUpdateUser(data, c, &db.DB)
	})

	// Get Profile
	account_group.Get("/profile", func(c *fiber.Ctx) error {
		return handlers.HandleGetProfile(c, &db.DB)
	})

	// Profile Update
	account_group.Post("/profile/update", func(c *fiber.Ctx) error {
		var data handlers.ProfileUpdateData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleProfileUpdate(data, c, &db.DB)
	})
}
