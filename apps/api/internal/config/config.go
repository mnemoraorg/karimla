package config

import (
	"fmt"
	"net/mail"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Environment   string
	Port          int
	DatabaseURL   string
	AuthBaseURL   string
	EmailDelivery EmailDeliveryConfig
	CORS          CORSConfig
}

type EmailDeliveryConfig struct {
	CloudflareAPIToken  string
	CloudflareAccountID string
	InvitationEmail     string
}

type CORSConfig struct {
	AllowedOrigins   []string
	AllowedMethods   []string
	AllowedHeaders   []string
	ExposedHeaders   []string
	AllowCredentials bool
}

func Load() (Config, error) {
	port, err := integer("PORT", 35080)
	if err != nil {
		return Config{}, err
	}
	if port < 1 || port > 65535 {
		return Config{}, fmt.Errorf("PORT must be between 1 and 65535")
	}

	emailDelivery := EmailDeliveryConfig{
		CloudflareAPIToken:  value("CLOUDFLARE_API_TOKEN", ""),
		CloudflareAccountID: value("CLOUDFLARE_ACCOUNT_ID", ""),
		InvitationEmail:     value("INVITATION_EMAIL", ""),
	}
	configuredEmailValues := 0
	for _, configured := range []string{
		emailDelivery.CloudflareAPIToken,
		emailDelivery.CloudflareAccountID,
		emailDelivery.InvitationEmail,
	} {
		if configured != "" {
			configuredEmailValues++
		}
	}
	if configuredEmailValues != 0 && configuredEmailValues != 3 {
		return Config{}, fmt.Errorf("CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and INVITATION_EMAIL must be configured together")
	}
	if emailDelivery.InvitationEmail != "" {
		parsed, err := mail.ParseAddress(emailDelivery.InvitationEmail)
		if err != nil || parsed.Address != emailDelivery.InvitationEmail {
			return Config{}, fmt.Errorf("INVITATION_EMAIL must be a valid email address")
		}
	}

	return Config{
		Environment:   value("ENVIRONMENT", "development"),
		Port:          port,
		DatabaseURL:   value("DATABASE_URL", ""),
		AuthBaseURL:   strings.TrimRight(value("AUTH_BASE_URL", "http://localhost:35081"), "/"),
		EmailDelivery: emailDelivery,
		CORS: CORSConfig{
			AllowedOrigins:   list(value("CORS_ALLOWED_ORIGINS", "http://localhost:35000")),
			AllowedMethods:   list(value("CORS_ALLOWED_METHODS", "GET,POST,PUT,DELETE,PATCH,OPTIONS")),
			AllowedHeaders:   list(value("CORS_ALLOWED_HEADERS", "Authorization,Content-Type,Idempotency-Key")),
			ExposedHeaders:   list(value("CORS_EXPOSE_HEADERS", "Content-Length,Content-Range")),
			AllowCredentials: boolean("CORS_ALLOW_CREDENTIALS", false),
		},
	}, nil
}

func value(name, fallback string) string {
	if current, ok := os.LookupEnv(name); ok && strings.TrimSpace(current) != "" {
		return strings.TrimSpace(current)
	}
	return fallback
}

func integer(name string, fallback int) (int, error) {
	current := value(name, strconv.Itoa(fallback))
	parsed, err := strconv.Atoi(current)
	if err != nil {
		return 0, fmt.Errorf("%s must be an integer: %w", name, err)
	}
	return parsed, nil
}

func boolean(name string, fallback bool) bool {
	current := value(name, strconv.FormatBool(fallback))
	parsed, err := strconv.ParseBool(current)
	return err == nil && parsed
}

func list(value string) []string {
	var values []string
	for _, item := range strings.Split(value, ",") {
		if item = strings.TrimSpace(item); item != "" {
			values = append(values, item)
		}
	}
	return values
}
