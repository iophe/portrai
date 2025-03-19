package server

import (
	"backend/lib/api/routes"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

type Server struct {
	*fiber.App
}

type ServerCfg struct {
	Port        uint
	LogFilepath string
}

func New() Server {
	return Server{
		App: fiber.New(),
	}
}

func (server *Server) Init(cfg *ServerCfg) {
	ConfigureServer(server.App, cfg)

	routes.RegisterRoutes(server.App)
}

func (server *Server) Start(cfg *ServerCfg) {
	err := server.Listen(fmt.Sprintf(":%d", cfg.Port))
	if err != nil {
		panic(fmt.Sprintf("cannot start server: %s", err))
	}
}
