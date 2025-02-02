package routes

import (
	"backend/lib/services/monitor"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(server *fiber.App) {
	monitor.RegisterMonitoringRoutes(server)

	api_group := server.Group("/api")

	v1_group := api_group.Group("/v1")

	v1_group.Get("/ping",
		func(c *fiber.Ctx) error {

			return c.SendStatus(fiber.StatusOK)
		},
	)

	RegisterAuthRoutes(v1_group)
	RegisterPaymentRoutes(v1_group)
}
