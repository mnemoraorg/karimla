package config_test

import (
	"testing"

	"github.com/mnemoraorg/yappi/apps/api/internal/config"
)

func TestLoadDefaultsToAPIPort(t *testing.T) {
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
	t.Setenv("DATABASE_URL", "postgres://karimla:karimla@localhost:5432/karimla")

	cfg, err := config.Load()
	if err != nil {
		t.Fatal(err)
	}
	if cfg.DatabaseURL != "postgres://karimla:karimla@localhost:5432/karimla" {
		t.Fatalf("database URL = %q, want DATABASE_URL", cfg.DatabaseURL)
	}
}

func TestLoadRejectsInvalidPort(t *testing.T) {
	t.Setenv("PORT", "not-a-port")

	if _, err := config.Load(); err == nil {
		t.Fatal("expected an error for a non-integer PORT")
	}
}
