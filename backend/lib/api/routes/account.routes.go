package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
	"backend/lib/services/sess"
	"backend/lib/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/csrf"
	futils "github.com/gofiber/fiber/v2/utils"
)

func RegisterAccountRoutes(group fiber.Router) {
	// Account Routes
	account_group := group.Group("/account")
	account_group.Use(middlewares.Protected())
	account_group.Use(csrf.New(csrf.Config{
		KeyLookup:         "header:X-Csrf-Token",
		CookieName:        "csrf_",
		CookieSameSite:    "Lax",
		CookieSecure:      utils.SECURE_COOKIE,
		CookieSessionOnly: true,
		KeyGenerator:      futils.UUIDv4,
		Expiration:        1 * time.Hour,
		Session:           sess.SESSIONS,
		SessionKey:        "fiber.csrf.token",
		HandlerContextKey: "fiber.csrf.handler",
	}))

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

	// avatar_cache := cache.New(cache.Config{
	// 	Next: func(c *fiber.Ctx) bool {
	// 		return c.Method() != "GET"
	// 	},
	// 	Expiration:           24 * time.Hour,
	// 	CacheControl:         true,
	// 	StoreResponseHeaders: true,
	// 	KeyGenerator: func(c *fiber.Ctx) string {
	// 		userID, err := middlewares.GetUserID(c)
	// 		if err != nil {
	// 			return c.Path() // Fallback
	// 		}
	// 		return c.Path() + "-" + string(userID[:])
	// 	},
	// })
	account_group.Get("/profile/avatar", func(c *fiber.Ctx) error {
		return handlers.HandleGetProfileAvatar(c)
	})

	account_group.Post("/profile/avatar/update", func(c *fiber.Ctx) error {
		return handlers.HandleUploadProfileAvatar(c)
	})
}
