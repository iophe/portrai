package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
	"fmt"
	"log/slog"

	"github.com/gofiber/fiber/v2"
)

func RegisterAccountRoutes(group fiber.Router) {
	// Account Routes
	account_group := group.Group("/account")
	account_group.Use(middlewares.Protected())

	// Profile Update
	account_group.Post("/profile/update", func(c *fiber.Ctx) error {
		var data handlers.ProfileUpdateData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		fmt.Println("Handler appelé avec:", data)

		return handlers.HandleProfileUpdate(data, c, &db.DB)
	})

	// Get Profile
	account_group.Get("/profile", func(c *fiber.Ctx) error {
		return handlers.HandleGetProfile(c, &db.DB)
	})

	// Upload Avatar
	account_group.Post("/avatar/upload", func(c *fiber.Ctx) error {
		// Gestion des fichiers uploadés via multipart

		file, err := c.FormFile("avatar")
		if err != nil {
			slog.Error("Failed to receive file", "error", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		fmt.Println("file extrait")

		result, err := handlers.HandleAvatarUpload(c, file, &db.DB)
		if err != nil {
			slog.Error("Failed to upload avatar", "error", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		return c.JSON(result)

	})

	/* 	// Delete Avatar
	   	account_group.Post("/avatar/delete", func(c *fiber.Ctx) error {
	   		return handlers.HandleAvatarDelete(c, &db.DB)
	   	})

	   	// Update Account Settings
	   	account_group.Post("/settings/update", func(c *fiber.Ctx) error {
	   		var data handlers.AccountSettingsUpdateData
	   		if err := c.BodyParser(&data); err != nil {
	   			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	   				"error": "Invalid request body",
	   			})
	   		}
	   		return handlers.HandleAccountSettingsUpdate(data, c, &db.DB)
	   	})

	   	// Update Notification Preferences
	   	account_group.Post("/notifications/update", func(c *fiber.Ctx) error {
	   		var data handlers.NotificationSettingsData
	   		if err := c.BodyParser(&data); err != nil {
	   			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	   				"error": "Invalid request body",
	   			})
	   		}
	   		return handlers.HandleNotificationSettingsUpdate(data, c, &db.DB)
	   	})

	   	// Get Account Settings
	   	account_group.Get("/settings", func(c *fiber.Ctx) error {
	   		return handlers.HandleGetAccountSettings(c, &db.DB)
	   	}) */

}
