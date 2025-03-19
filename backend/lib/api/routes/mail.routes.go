package routes

import (
	"backend/lib/api/handlers"

	"github.com/gofiber/fiber/v2"
)

func RegisterMailRoutes(group fiber.Router) {
	mail_group := group.Group("/mail")

	mail_group.Post("/issue", func(c *fiber.Ctx) error {
		var data handlers.IssueData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleNewIssue(c, data)
	})
}
