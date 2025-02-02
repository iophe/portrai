package cache

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/redis/go-redis/v9"
)

type Cache struct {
	Client *redis.Client
}

type CacheCfg struct {
	Address string
	Port    string
	User    string
}

var CACHE Cache = Cache{}

func (cache *Cache) Connect(password string, cfg *CacheCfg) error {
	slog.Info("attempting connection to the cache at", "addr", fmt.Sprintf("%s:%s", cfg.Address, cfg.Port))
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.Address, cfg.Port),
		Username: cfg.User,
		Password: password,
	})
	cache.Client = client
	ctx := context.Background()
	_, err := cache.Client.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect to Dragonfly: %w", err)
	}
	slog.Info("Cache connection succeeded")
	return nil
}
