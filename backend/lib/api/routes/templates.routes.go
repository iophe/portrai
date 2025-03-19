package routes

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterTemplateRoutes(group fiber.Router) {
	templates_group := group.Group("/templates")

	templates_group.Static("/confirmation.html", "./templates/confirmation.html")
	templates_group.Static("/recovery.html", "./templates/recovery.html")
}
