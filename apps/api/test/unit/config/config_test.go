package config_test

import (
	"testing"

	"github.com/mnemoraorg/yappi/apps/api/internal/config"
)

func clearEmailDeliveryEnv(t *testing.T) {
	t.Helper()
	t.Setenv("CLOUDFLARE_API_TOKEN", "")
	t.Setenv("CLOUDFLARE_ACCOUNT_ID", "")
	t.Setenv("INVITATION_EMAIL", "")
}

func TestLoadDefaultsToAPIPort(t *testing.T) {
	clearEmailDeliveryEnv(t)
	t.Setenv("PORT", "")

	cfg, err := config.Load()
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Port != 35080 {
		t.Fatalf("port = %d, want %d", cfg.Port, 35080)
	}
}

func TestLoadUsesDatabaseURL(t *testing.T) {
	clearEmailDeliveryEnv(t)
	t.Setenv("DATABASE_URL", "postgres://karimla:karimla@localhost:5432/karimla")

	cfg, err := config.Load()
	if err != nil {
		t.Fatal(err)
	}
	if cfg.DatabaseURL != "postgres://karimla:karimla@localhost:5432/karimla" {
		t.Fatalf("database URL = %q, want DATABASE_URL", cfg.DatabaseURL)
	}
}

func TestLoadEmailDeliveryConfig(t *testing.T) {
	t.Setenv("CLOUDFLARE_API_TOKEN", "test-token")
	t.Setenv("CLOUDFLARE_ACCOUNT_ID", "account-id")
	t.Setenv("INVITATION_EMAIL", "invite@example.com")

	cfg, err := config.Load()
	if err != nil {
		t.Fatal(err)
	}
	if cfg.EmailDelivery.InvitationEmail != "invite@example.com" || cfg.EmailDelivery.CloudflareAccountID != "account-id" {
		t.Fatalf("email config = %+v, want configured invitation sender", cfg.EmailDelivery)
	}
}

func TestLoadRejectsPartialEmailDeliveryConfig(t *testing.T) {
	clearEmailDeliveryEnv(t)
	t.Setenv("CLOUDFLARE_API_TOKEN", "test-token")

	if _, err := config.Load(); err == nil {
		t.Fatal("expected an error for partial Cloudflare email configuration")
	}
}

func TestLoadRejectsInvalidPort(t *testing.T) {
	clearEmailDeliveryEnv(t)
	t.Setenv("PORT", "not-a-port")

	if _, err := config.Load(); err == nil {
		t.Fatal("expected an error for a non-integer PORT")
	}
}
