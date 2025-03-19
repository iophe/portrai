package lib

import (
	"backend/lib/server"
	"backend/lib/services/cache"
	"backend/lib/services/db"
	"backend/lib/services/mailer"
	"backend/lib/services/monitor"
	"backend/lib/utils"
	"fmt"
	"log/slog"
	"strconv"
	"time"
)

type Cfg struct {
	ServerCfg server.ServerCfg
}

func Setup() (Cfg, error) {
	slog.Info("Setting up server configuration ...")
	port, err := strconv.Atoi(utils.SERVER_PORT)
	if err != nil {
		slog.Warn("invalid port found in env, expected a valid positive integer, defaulting to 3000", "err", err)
		port = 3000
	}
	server_cfg := server.ServerCfg{
		Port:        uint(port),
		LogFilepath: utils.LOG_FILEPATH,
	}

	// DATABASE
	slog.Info("Setting up database ...")
	err = db.DB.Connect(utils.POSTGRES_PASSWORD, &db.DBCfg{
		Address: utils.POSTGRES_HOST,
		Name:    utils.POSTGRES_DB,
		Port:    utils.POSTGRES_PORT,
		User:    utils.POSTGRES_USER,
	})
	if err != nil {
		slog.Error("failed to connect to the database", "err", err)
		return Cfg{}, fmt.Errorf("failed to connect to the database")
	}
	slog.Info("Successful database set up")

	// CACHE
	slog.Info("Setting up cache ...")
	err = cache.CACHE.Connect(utils.DRAGONFLY_PASSWORD, &cache.CacheCfg{
		Address: utils.DRAGONFLY_ADDR,
		Port:    utils.DRAGONFLY_PORT,
		User:    utils.DRAGONFLY_USER,
	})
	if err != nil {
		slog.Error("failed to connect to the cache", "err", err)
		return Cfg{}, fmt.Errorf("failed to connect to the cache")
	}
	slog.Info("Successful cache set up")

	// MONITOR
	slog.Info("Setting up monitoring ...")
	err = monitor.InitMonitor()
	if err != nil {
		slog.Error("failed to start monitoring", "err", err)
		return Cfg{}, fmt.Errorf("failed to start monitoring")
	}
	monitor.StartSystemMetricsCollection(30 * time.Second)
	slog.Info("Successful monitoring set up")

	// MAIL
	slog.Info("Setting up mailer ...")
	mailer.Mailer = mailer.NewMailer(mailer.EmailCfg{
		Host:     utils.MAILER_SMTP_HOST,
		Port:     utils.MAILER_SMTP_PORT,
		Username: utils.MAILER_SMTP_USERNAME,
		Password: utils.MAILER_SMTP_PASSWORD,
	})
	slog.Info("Successful mailer set up")

	slog.Info("Successful server configuration set up")
	return Cfg{
		ServerCfg: server_cfg,
	}, nil
}
