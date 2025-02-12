//go:build dev

package server

import (
	"backend/lib/services/logs"
	"backend/lib/services/monitor"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/session"
)

const AUTH_URL = "http://localhost:8000/auth/v1"

func ConfigureServer(app *fiber.App, cfg *ServerCfg) {
	// Security headers
	app.Use(helmet.New())
	app.Use(recover.New())

	// Session configuration
	SESSIONS = session.New(session.Config{
		Expiration:     24 * time.Hour,
		KeyLookup:      "cookie:session",
		CookiePath:     "/",
		CookieSecure:   false, // Set to true in production with HTTPS
		CookieHTTPOnly: true,
	})

	err := logs.InitLogger(cfg.LogFilepath)
	if err == nil {
		app.Use(logs.Logger())
	}

	app.Use(monitor.MonitorMiddleware())

	// CORS configuration
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5050",
		AllowCredentials: true,
		AllowMethods:     "GET,POST",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-CSRF-Token",
	}))

}
