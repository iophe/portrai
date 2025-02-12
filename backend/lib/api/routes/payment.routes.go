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

	// Protected routes (auth + CSRF)
	protected_routes := payment_group.Group("")
	protected_routes.Use(
		middlewares.Protected(),
		middlewares.CSRFMiddleware(middlewares.CSRFConfig{
			ExemptRoutes: []string{"/api/payment/webhook"},
		}),
	)

	protected_routes.Post("/create-checkout-session", func(c *fiber.Ctx) error {
		var data handlers.CreateCheckoutData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err,
			})
		}
		return handlers.HandleCreateCheckoutSession(c, data, &db.DB)
	})

}
