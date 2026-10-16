package app

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net"
	"strings"
	"time"

	"github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/option"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/mnemoraorg/yappi/apps/api/internal/adapter/betterauth"
	emailadapter "github.com/mnemoraorg/yappi/apps/api/internal/adapter/email"
	postgresadapter "github.com/mnemoraorg/yappi/apps/api/internal/adapter/postgres"
	"github.com/mnemoraorg/yappi/apps/api/internal/config"
	deliveryhttp "github.com/mnemoraorg/yappi/apps/api/internal/delivery/http"
	v1 "github.com/mnemoraorg/yappi/apps/api/internal/delivery/http/v1"
	domaingroup "github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
	groupservice "github.com/mnemoraorg/yappi/apps/api/internal/domain/group/service"
	grouphandler "github.com/mnemoraorg/yappi/apps/api/internal/handler/v1/group"
)

type Application struct {
	http    *fiber.App
	address string
	db      *sql.DB
}

func New(cfg config.Config) (*Application, error) {
	server := fiber.New(fiber.Config{AppName: "yappi-api"})
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

	var store *postgresadapter.Store
	var db *sql.DB
	if cfg.DatabaseURL != "" {
		var err error
		db, err = sql.Open("pgx", cfg.DatabaseURL)
		if err != nil {
			return nil, fmt.Errorf("open database: %w", err)
		}
		db.SetMaxOpenConns(10)
		db.SetMaxIdleConns(5)
		db.SetConnMaxLifetime(4 * time.Minute)
		db.SetConnMaxIdleTime(time.Minute)
		store = postgresadapter.New(db)
	}

	var dependencies v1.Dependencies
	if store != nil {
		sessionClient := betterauth.NewSessionClient(cfg.AuthBaseURL)
		var invitationSender domaingroup.InvitationSender
		if cfg.EmailDelivery.CloudflareAPIToken != "" {
			cloudflareClient := cloudflare.NewClient(option.WithAPIToken(cfg.EmailDelivery.CloudflareAPIToken))
			invitationSender = emailadapter.NewCloudflareInvitationSender(
				cfg.EmailDelivery, cloudflareClient.EmailSending,
			)
		}
		groupService := groupservice.NewService(store.Groups(), store.GroupCounts(), invitationSender)
		dependencies = v1.Dependencies{
			Groups: grouphandler.New(groupService),
			Auth:   sessionClient,
		}
	}
	deliveryhttp.Register(server, dependencies)
	return &Application{http: server, address: fmt.Sprintf(":%d", cfg.Port), db: db}, nil
}

func (a *Application) Run(ctx context.Context) error {
	listener, err := net.Listen("tcp", a.address)
	if err != nil {
		return fmt.Errorf("listen on %s: %w", a.address, err)
	}
	defer listener.Close()
	defer func() {
		if a.db != nil {
			_ = a.db.Close()
		}
	}()

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
