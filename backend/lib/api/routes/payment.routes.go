package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/db"

	"github.com/gofiber/fiber/v2"
)

func RegisterPaymentRoutes(group fiber.Router) {
	payment_group := group.Group("/payment")

	// Public route (webhook from Stripe)
	payment_group.Post("/webhook", func(c *fiber.Ctx) error {
		return handlers.HandleWebhook(c, &db.DB)
	})

	payment_group.Use(
		middlewares.Protected(),
		func(c *fiber.Ctx) error {
			var data handlers.CreateCheckoutData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": err,
				})
			}
			return handlers.HandleCreateCheckoutSession(c, data, &db.DB)
		},
	)

	payment_group.Get("/refresh",
		middlewares.Protected(),
		func(c *fiber.Ctx) error {
			user_id, err := middlewares.GetUserID(c)
			if err != nil {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error": "Unauthorized access",
				})
			}
			token, err := middlewares.RefreshPaymentToken(user_id, &db.DB)
			if err != nil {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error": "failed to create payment token",
				})
			}
			middlewares.SetPaymentCookies(c, token)
			return c.SendStatus(fiber.StatusOK)
		},
	)
}
