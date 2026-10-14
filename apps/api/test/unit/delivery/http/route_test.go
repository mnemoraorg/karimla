package http_test

import (
	"io"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	httpdelivery "github.com/mnemoraorg/yappi/apps/api/internal/delivery/http"
)

func TestRegisterHealthRoute(t *testing.T) {
	app := fiber.New()
	httpdelivery.Register(app)

	response, err := app.Test(httptest.NewRequest("GET", "/api/v1/health", nil))
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != fiber.StatusOK {
		t.Fatalf("status = %d, want %d", response.StatusCode, fiber.StatusOK)
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatal(err)
	}
	if string(body) != `{"groups":["liveness","readiness"],"status":"UP"}` {
		t.Fatalf("body = %s, want %s", body, `{"groups":["liveness","readiness"],"status":"UP"}`)
	}
}
