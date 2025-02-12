package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/db"

	"github.com/gofiber/fiber/v2"
)

func RegisterResumeRoutes(group fiber.Router) {
	resume_group := group.Group("/resume")

	resume_group.Use(middlewares.Protected())

	experience_group := resume_group.Group("/experience")

	experience_group.Post("/create", func(c *fiber.Ctx) error {
		var data handlers.ExperienceCreationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleExperienceCreation(data, c, &db.DB)
	})

	experience_group.Post("/update", func(c *fiber.Ctx) error {
		var data handlers.ExperienceUpdateData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleExperienceUpdate(data, c, &db.DB)
	})

	experience_group.Get("/all", func(c *fiber.Ctx) error {
		return handlers.HandleGetAllExperiences(c, &db.DB)
	})

	experience_group.Get("/one", func(c *fiber.Ctx) error {
		var params handlers.GetExperienceParams
		if err := c.QueryParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		return handlers.HandleGetExperience(params, c, &db.DB)
	})

	experience_group.Post("/delete", func(c *fiber.Ctx) error {
		var params handlers.DeleteExperienceParams
		if err := c.QueryParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		return handlers.HandleDeleteExperience(params, c, &db.DB)
	})
}
