//go:build !dev

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
		AllowOrigins:     "https://portraipreprod.site,https://www.portraipreprod.site,http://localhost:5050,http://localhost:3000",
		AllowCredentials: true,
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-CSRF-Token,X-Requested-With,X-HTTP-Method-Override",
		MaxAge:           86400, // 24 hours
	}))

	// Ajouter des en-têtes CORP et COEP
	app.Use(func(c *fiber.Ctx) error {
		c.Set("Cross-Origin-Resource-Policy", "cross-origin")
		c.Set("Cross-Origin-Opener-Policy", "same-origin")
		return c.Next()
	})

}
