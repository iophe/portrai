package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/cache"
	"backend/lib/services/db"
	"log/slog"

	"github.com/gofiber/fiber/v2"
)

func RegisterAuthRoutes(group fiber.Router) {
	auth_group := group.Group("/auth")

	auth_group.Post("/signup/email",
		func(c *fiber.Ctx) error {
			var data handlers.EmailSignupData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			res, err := handlers.HandleEmailSignup(c, data, &db.DB)
			if err != nil {
				slog.Error("signup failed", "err", err)
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": err.Error(),
				})
			}
			return c.Status(fiber.StatusOK).JSON(res)
		},
	)

	auth_group.Post("/signup/email/resend-verification",
		func(c *fiber.Ctx) error {
			var data handlers.ResendVerificationData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			return handlers.HandleResendVerification(c, data)
		},
	)

	auth_group.Post("/signup/email/verify-email",
		func(c *fiber.Ctx) error {
			var data handlers.VerifyEmailData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			return handlers.HandleVerifyEmail(c, data)
		},
	)

	auth_group.Post("/signup/email/verify-email-code",
		func(c *fiber.Ctx) error {
			var data handlers.VerifyEmailCodeData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			return handlers.HandleVerifyEmailCode(c, data)
		},
	)

	auth_group.Post("/signin/email",
		func(c *fiber.Ctx) error {
			var data handlers.EmailSigninData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			res, err := handlers.HandleEmailSignin(c, data)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": err,
				})
			}
			return c.Status(fiber.StatusOK).JSON(res)
		},
	)

	auth_group.Post("/signin/google",
		func(c *fiber.Ctx) error {
			var data handlers.GoogleSignupData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			res, err := handlers.HandleGoogleSignin(c, data)
			if err != nil {
				slog.Error("Google sign-in failed", "err", err)
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": err.Error(),
				})
			}
			return c.Status(fiber.StatusOK).JSON(res)
		},
	)
	auth_group.Get("/signin/google/callback",
		func(c *fiber.Ctx) error {
			var query handlers.GoogleCallbackQuery
			if err := c.QueryParser(&query); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			return handlers.HandleGoogleCallback(c, query)

		})
	auth_group.Post("/recover/password",
		func(c *fiber.Ctx) error {
			var data handlers.PasswordRecoveryData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			return handlers.HandlePasswordRecovery(c, data)
		},
	)

	auth_group.Post("/recover/password/resend",
		func(c *fiber.Ctx) error {
			var data handlers.PasswordRecoveryData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			return handlers.HandleResendRecovery(c, data)
		},
	)

	auth_group.Post("/recover/password/reset",
		func(c *fiber.Ctx) error {
			var data handlers.PasswordResetData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			return handlers.HandlePasswordReset(c, data)
		},
	)

	auth_group.Post("/recover/password/reset-with-code",
		func(c *fiber.Ctx) error {
			var data handlers.PasswordResetCodeData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			return handlers.HandlePasswordResetWithCode(c, data)
		},
	)

	auth_group.Post("/recover/password/update",
		middlewares.Protected(),
		func(c *fiber.Ctx) error {
			var data handlers.PasswordUpdateData
			if err := c.BodyParser(&data); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid request body",
				})
			}
			return handlers.HandlePasswordUpdate(c, data)
		},
	)

	auth_group.Get("/user-email",
		middlewares.Protected(),
		func(c *fiber.Ctx) error {
			return handlers.HandleGetAuthUserEmail(c)
		})

	auth_group.Get("/check",
		middlewares.Protected(),
		func(c *fiber.Ctx) error {
			return c.SendStatus(fiber.StatusOK)
		})

	auth_group.Post("/logout",
		middlewares.Protected(),
		func(c *fiber.Ctx) error {
			return handlers.HandleLogout(c)
		})

	auth_group.Post("/delete",
		middlewares.Protected(),
		func(c *fiber.Ctx) error {
			return handlers.HandleDeleteAccount(c, &cache.CACHE, &db.DB)
		})
}
