//go:build !dev

package server

import "github.com/gofiber/fiber/v2"

const AUTH_URL = "http://localhost:8000/auth/v1"

func ConfigureServer(app *fiber.App, cfg *ServerCfg) {

}
