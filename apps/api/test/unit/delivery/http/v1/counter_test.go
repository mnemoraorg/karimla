package http_test

import (
	"context"
	"io"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	httpv1 "github.com/mnemoraorg/karimla/apps/api/internal/delivery/http/v1"
	"github.com/mnemoraorg/karimla/apps/api/internal/domain/counter"
	counterservice "github.com/mnemoraorg/karimla/apps/api/internal/domain/counter/service"
	counterhandler "github.com/mnemoraorg/karimla/apps/api/internal/handler/api/counter"
	"github.com/mnemoraorg/karimla/apps/api/internal/shared"
)

type fakeRepository struct {
	rows map[string]int
}

func (f *fakeRepository) Get(_ context.Context, authUserID string) (counter.Counter, error) {
	count, ok := f.rows[authUserID]
	if !ok {
		return counter.Counter{}, counter.ErrNotFound
	}
	return counter.Counter{AuthUserID: authUserID, Count: count}, nil
}

func (f *fakeRepository) Increment(_ context.Context, authUserID string) (counter.Counter, error) {
	f.rows[authUserID] = f.rows[authUserID] + 1
	return counter.Counter{AuthUserID: authUserID, Count: f.rows[authUserID]}, nil
}

func (f *fakeRepository) Decrement(_ context.Context, authUserID string) (counter.Counter, error) {
	if f.rows[authUserID] > 0 {
		f.rows[authUserID] = f.rows[authUserID] - 1
	}
	return counter.Counter{AuthUserID: authUserID, Count: f.rows[authUserID]}, nil
}

type stubValidator struct{}

func (stubValidator) Validate(_ context.Context, cookie, _ string) (shared.Principal, bool, error) {
	if cookie == "" {
		return shared.Principal{}, false, nil
	}
	return shared.Principal{AuthUserID: "user-1"}, true, nil
}

func TestCounterRoutesRequireAndServeSession(t *testing.T) {
	app := fiber.New()
	httpv1.Register(app.Group("/api"), httpv1.Dependencies{
		Handlers: counterhandler.New(counterservice.NewService(&fakeRepository{rows: map[string]int{}})),
		Auth:     stubValidator{},
	})

	unauthorized, err := app.Test(httptest.NewRequest("GET", "/api/v1/counter", nil))
	if err != nil {
		t.Fatal(err)
	}
	if unauthorized.StatusCode != fiber.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", unauthorized.StatusCode, fiber.StatusUnauthorized)
	}

	incrementRequest := httptest.NewRequest("POST", "/api/v1/counter/increment", nil)
	incrementRequest.Header.Set("Cookie", "better-auth.session_token=test")
	increment, err := app.Test(incrementRequest)
	if err != nil {
		t.Fatal(err)
	}
	body, err := io.ReadAll(increment.Body)
	if err != nil {
		t.Fatal(err)
	}
	if increment.StatusCode != fiber.StatusOK {
		t.Fatalf("status = %d, want %d (body %s)", increment.StatusCode, fiber.StatusOK, body)
	}
	if got := string(body); !strings.Contains(got, `"count":1`) {
		t.Fatalf("body = %s, want count 1", got)
	}

	deniedDecrement, err := app.Test(httptest.NewRequest("POST", "/api/v1/counter/decrement", nil))
	if err != nil {
		t.Fatal(err)
	}
	if deniedDecrement.StatusCode != fiber.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", deniedDecrement.StatusCode, fiber.StatusUnauthorized)
	}

	decrementRequest := httptest.NewRequest("POST", "/api/v1/counter/decrement", nil)
	decrementRequest.Header.Set("Cookie", "better-auth.session_token=test")
	decrement, err := app.Test(decrementRequest)
	if err != nil {
		t.Fatal(err)
	}
	decrementBody, err := io.ReadAll(decrement.Body)
	if err != nil {
		t.Fatal(err)
	}
	if decrement.StatusCode != fiber.StatusOK {
		t.Fatalf("status = %d, want %d (body %s)", decrement.StatusCode, fiber.StatusOK, decrementBody)
	}
	if got := string(decrementBody); !strings.Contains(got, `"count":0`) {
		t.Fatalf("body = %s, want count 0", got)
	}
}
