package app

import (
	"context"
	"errors"
	"fmt"
	"net"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/mnemoraorg/karimla/apps/api/internal/config"
	deliveryhttp "github.com/mnemoraorg/karimla/apps/api/internal/delivery/http"
)

type Application struct {
	http    *fiber.App
	address string
}

func New(cfg config.Config) (*Application, error) {
	server := fiber.New(fiber.Config{AppName: "karimla-api"})
	server.Use(logger.New())
	if len(cfg.CORS.AllowedOrigins) > 0 {
		server.Use(cors.New(cors.Config{
			AllowOrigins:     strings.Join(cfg.CORS.AllowedOrigins, ","),
			AllowMethods:     strings.Join(cfg.CORS.AllowedMethods, ","),
			AllowHeaders:     strings.Join(cfg.CORS.AllowedHeaders, ","),
			ExposeHeaders:    strings.Join(cfg.CORS.ExposedHeaders, ","),
			AllowCredentials: cfg.CORS.AllowCredentials,
		}))
	}

	deliveryhttp.Register(server)
	return &Application{http: server, address: fmt.Sprintf(":%d", cfg.Port)}, nil
}

func (a *Application) Run(ctx context.Context) error {
	listener, err := net.Listen("tcp", a.address)
	if err != nil {
		return fmt.Errorf("listen on %s: %w", a.address, err)
	}
	defer listener.Close()

	errCh := make(chan error, 1)
	go func() {
		errCh <- a.http.Listener(listener)
	}()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
		shutdownErr := a.http.ShutdownWithTimeout(10 * time.Second)
		if shutdownErr != nil && !errors.Is(shutdownErr, context.Canceled) {
			return shutdownErr
		}
		return nil
	}
}
