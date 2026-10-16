package app_test

import (
	"bytes"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/mnemoraorg/yappi/apps/api/internal/app"
)

func TestAccessLoggerAttributesStrayRequests(t *testing.T) {
	var output bytes.Buffer
	server := fiber.New()
	server.Use(app.NewAccessLogger(&output))

	request := httptest.NewRequest(http.MethodHead, "/", nil)
	request.Header.Set("User-Agent", "probe-client/1.0")
	request.Header.Set("Cookie", "session=secret-value")
	response, err := server.Test(request)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	response.Body.Close()

	line := output.String()
	for _, want := range []string{"404", "HEAD", "/", "probe-client/1.0"} {
		if !strings.Contains(line, want) {
			t.Errorf("log line = %q, want it to contain %q", line, want)
		}
	}
	if strings.Contains(line, "secret-value") {
		t.Errorf("log line = %q, must not contain cookie values", line)
	}
}

func TestAccessLoggerKeepsTheServiceShape(t *testing.T) {
	var output bytes.Buffer
	server := fiber.New()
	server.Use(app.NewAccessLogger(&output))
	server.Get("/api/v1/health", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	request := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	request.Header.Set("User-Agent", "health-probe/2.0")
	response, err := server.Test(request)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	_, _ = io.Copy(io.Discard, response.Body)
	response.Body.Close()

	line := strings.TrimSpace(output.String())
	parts := strings.Split(line, " | ")
	if len(parts) != 8 {
		t.Fatalf("log line = %q, want 8 pipe-separated fields", line)
	}
	for index, want := range []string{"200", "GET", "/api/v1/health", "health-probe/2.0"} {
		found := false
		for _, part := range parts {
			if strings.Contains(part, want) {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("log line = %q, want a field containing %q (field %d)", line, want, index)
		}
	}
}
