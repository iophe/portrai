package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/db"

	"github.com/gofiber/fiber/v2"
)

func RegisterPaymentRoutes(group fiber.Router) {
	payment_group := group.Group("/payment")

	payment_group.Post("/webhook", func(c *fiber.Ctx) error {
		return handlers.HandleWebhook(c, &db.DB)
	})

	payment_group.Post("/create-checkout-session",
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

	payment_group.Post("/cancel-subscription/:subscription_id",
		middlewares.Protected(),
		func(c *fiber.Ctx) error {
			var params handlers.CancelSubscriptionParams
			if err := c.ParamsParser(&params); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": err,
				})
			}
			return handlers.HandleCancelSubscription(c, params, &db.DB)
		},
	)

}
