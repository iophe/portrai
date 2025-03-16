package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/cache"
	"backend/lib/services/db"
	"backend/lib/utils"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"

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
			// Extract the authorization code from the query parameters
			code := c.Query("code")
			if code == "" {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "No authorization code provided",
				})
			}

			// Forward the request to the internal GoTrue service
			request, err := http.NewRequest("GET",
				fmt.Sprintf("%s/callback?provider=google&code=%s", utils.KONG_AUTH_URL, code),
				nil)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to create request",
				})
			}

			// Add necessary headers
			request.Header.Set("Content-Type", "application/json")
			request.Header.Set("apikey", utils.SERVICE_ROLE_KEY)

			// Execute the request
			client := &http.Client{}
			response, err := client.Do(request)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to communicate with auth service",
				})
			}
			defer response.Body.Close()

			// Read and parse the response
			body, err := io.ReadAll(response.Body)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to read response",
				})
			}

			if response.StatusCode != http.StatusOK {
				return c.Status(response.StatusCode).Send(body)
			}

			// Parse the auth response
			var auth_response handlers.AuthResponse
			if err := json.Unmarshal(body, &auth_response); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to parse auth response",
				})
			}

			// Set auth cookies
			middlewares.SetAuthCookies(c, &middlewares.RefreshResponse{
				AccessToken:  auth_response.AccessToken,
				RefreshToken: auth_response.RefreshToken,
			})

			// Redirect to the frontend after successful authentication
			return c.Redirect("/")
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
