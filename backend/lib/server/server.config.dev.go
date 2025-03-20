//go:build dev

package server

import (
	"backend/lib/services/logs"
	"backend/lib/services/monitor"
	"backend/lib/services/sess"
	"backend/lib/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/encryptcookie"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/session"
)

const AUTH_URL = "http://localhost:8000/auth/v1"

func ConfigureServer(app *fiber.App, cfg *ServerCfg) {
	// Security headers
	app.Use(helmet.New())
	app.Use(recover.New())

	// CORS configuration
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5050,http://localhost:3000",
		AllowCredentials: true,
		AllowMethods:     "GET,POST,OPTIONS,HEAD",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Csrf-Token,X-Requested-With",
	}))

	// Cookie encription
	app.Use(encryptcookie.New(encryptcookie.Config{
		Key:    utils.COOKIES_ENCRYPTION_KEY,
		Except: []string{"csrf_"}, // exclude CSRF cookie
	}))

	// Session configuration
	sess.SESSIONS = session.New(session.Config{
		Expiration:     24 * time.Hour,
		KeyLookup:      "cookie:session",
		CookiePath:     "/",
		CookieSecure:   utils.SECURE_COOKIE,
		CookieHTTPOnly: true,
	})

	app.Use(limiter.New(limiter.Config{
		Max:               50,
		Expiration:        1 * time.Minute,
		LimiterMiddleware: limiter.SlidingWindow{},
	}))

	err := logs.InitLogger(cfg.LogFilepath)
	if err == nil {
		app.Use(logs.Logger())
	}

	app.Use(monitor.MonitorMiddleware())

}
