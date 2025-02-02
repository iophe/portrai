package logs

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
)

type multiHandler struct {
	handlers []slog.Handler
}

func (h *multiHandler) Enabled(ctx context.Context, level slog.Level) bool {
	for _, handler := range h.handlers {
		if handler.Enabled(ctx, level) {
			return true
		}
	}
	return false
}

func (h *multiHandler) Handle(ctx context.Context, r slog.Record) error {
	for _, handler := range h.handlers {
		if err := handler.Handle(ctx, r); err != nil {
			return err
		}
	}
	return nil
}

func (h *multiHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	handlers := make([]slog.Handler, len(h.handlers))
	for i, handler := range h.handlers {
		handlers[i] = handler.WithAttrs(attrs)
	}
	return &multiHandler{handlers: handlers}
}

func (h *multiHandler) WithGroup(name string) slog.Handler {
	handlers := make([]slog.Handler, len(h.handlers))
	for i, handler := range h.handlers {
		handlers[i] = handler.WithGroup(name)
	}
	return &multiHandler{handlers: handlers}
}

func NewMultiHandler(handlers ...slog.Handler) slog.Handler {
	return &multiHandler{handlers: handlers}
}

func InitLogger(log_file_path string) error {
	// Console handler
	console_handler := slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})

	// File handler
	log_file, err := os.OpenFile(log_file_path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		slog.Error("Cannot open file", "file", log_file_path)
		return err
	}
	file_handler := slog.NewJSONHandler(log_file, &slog.HandlerOptions{Level: slog.LevelInfo})

	// Multi-handler
	multi_handler := NewMultiHandler(console_handler, file_handler)

	defaultLogger := slog.New(multi_handler)
	slog.SetDefault(defaultLogger)

	return nil
}

func Logger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start_time := time.Now()

		// Create request info attributes
		request_attrs := []slog.Attr{
			slog.String("method", c.Method()),
			slog.String("path", c.Path()),
			slog.String("ip", c.IP()),
			slog.String("user_agent", c.Get("User-Agent")),
		}

		// Process request
		err := c.Next()

		// Log response info
		response_time := time.Since(start_time)
		status_code := c.Response().StatusCode()

		// Create response info attributes
		response_attrs := []slog.Attr{
			slog.Int("status_code", status_code),
			slog.Duration("response_time", response_time),
		}

		// Combine all attributes
		all_attrs := append(request_attrs, response_attrs...)

		log_msg := "Request processed"
		if err != nil {
			log_msg = "Request error"
			slog.LogAttrs(context.Background(), slog.LevelError, log_msg, all_attrs...)
		} else {
			slog.LogAttrs(context.Background(), slog.LevelInfo, log_msg, all_attrs...)
		}

		return err
	}
}
