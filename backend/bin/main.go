package main

import (
	"backend/lib"
	"backend/lib/server"
	"log/slog"
)

func main() {
	cfg, err := lib.Setup()
	if err != nil {
		slog.Error("could not setup the server", "err", err)
		return
	}

	server := server.New()
	server.Init(&cfg.ServerCfg)
	server.Start(&cfg.ServerCfg)
}
