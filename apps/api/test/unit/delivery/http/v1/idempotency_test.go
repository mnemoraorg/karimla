package http_test

import (
	"context"
	"errors"
	"io"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/gofiber/fiber/v2"
	httpv1 "github.com/mnemoraorg/yappi/apps/api/internal/delivery/http/v1"
	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
	groupservice "github.com/mnemoraorg/yappi/apps/api/internal/domain/group/service"
	grouphandler "github.com/mnemoraorg/yappi/apps/api/internal/handler/v1/group"
	"github.com/mnemoraorg/yappi/apps/api/internal/middleware/idempotency"
)

type storedIdempotencyRow struct {
	status int
	body   []byte
}

type fakeIdempotencyStore struct {
	mu     sync.Mutex
	rows   map[string]storedIdempotencyRow
	getErr error
}

func idempotencyRowKey(key, endpoint, user string) string {
	return key + "|" + endpoint + "|" + user
}

func (f *fakeIdempotencyStore) FindResponse(
	_ context.Context,
	key, endpoint, authUserID string,
) (idempotency.StoredResponse, bool, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.getErr != nil {
		return idempotency.StoredResponse{}, false, f.getErr
	}
	row, ok := f.rows[idempotencyRowKey(key, endpoint, authUserID)]
	if !ok {
		return idempotency.StoredResponse{}, false, nil
	}
	return idempotency.StoredResponse{Status: row.status, Body: row.body}, true, nil
}

func (f *fakeIdempotencyStore) SaveResponse(
	_ context.Context,
	key, endpoint, authUserID string,
	response idempotency.StoredResponse,
) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	// Clone retained keys for the same reason the production middleware does:
	// Fiber values may alias recycled request buffers.
	key = strings.Clone(key)
	endpoint = strings.Clone(endpoint)
	authUserID = strings.Clone(authUserID)
	f.rows[idempotencyRowKey(key, endpoint, authUserID)] = storedIdempotencyRow{
		status: response.Status,
		body:   append([]byte(nil), response.Body...),
	}
	return nil
}

func (f *fakeIdempotencyStore) PurgeExpired(_ context.Context) (int, error) {
	return 0, nil
}

type idempotencyFixture struct {
	app    *fiber.App
	groups *fakeGroups
	counts *fakeCounts
}

func newIdempotencyFixture(store idempotency.Store) *idempotencyFixture {
	groups := &fakeGroups{
		groups: map[string]group.Group{
			"g1": {ID: "g1", Name: "Crew", Phrase: "karimla", InviteCode: "CODE", CreatedBy: "user-1"},
		},
		members: map[string]map[string]group.Member{
			"g1": {
				"user-1": {AuthUserID: "user-1", DisplayName: "User One"},
				"user-2": {AuthUserID: "user-2", DisplayName: "User Two"},
			},
		},
		byCode: map[string]string{"CODE": "g1"},
	}
	counts := &fakeCounts{rows: map[string]map[string]int{}}
	service := groupservice.NewService(groups, counts, &fakeInvitationSender{})
	app := fiber.New()
	httpv1.Register(app.Group("/api"), httpv1.Dependencies{
		Groups:      grouphandler.New(service),
		Auth:        cookieValidator{},
		Idempotency: store,
	})
	return &idempotencyFixture{app: app, groups: groups, counts: counts}
}

func tapCount(
	t *testing.T,
	app *fiber.App,
	target, user, key string,
) (int, string, string) {
	t.Helper()
	request := httptest.NewRequest(fiber.MethodPost, target, nil)
	request.Header.Set("Cookie", "user="+user)
	if key != "" {
		request.Header.Set(idempotency.HeaderName, key)
	}
	response, err := app.Test(request)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer response.Body.Close()
	payload, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatalf("read body: %v", err)
	}
	return response.StatusCode, string(payload), response.Header.Get("content-type")
}

func TestIdempotentCountReplaysRepeatedKey(t *testing.T) {
	fixture := newIdempotencyFixture(&fakeIdempotencyStore{rows: map[string]storedIdempotencyRow{}})
	target := "/api/v1/groups/g1/members/user-2/increment"

	firstStatus, firstBody, _ := tapCount(t, fixture.app, target, "user-1", "key-1")
	secondStatus, secondBody, contentType := tapCount(t, fixture.app, target, "user-1", "key-1")

	if firstStatus != fiber.StatusOK || secondStatus != fiber.StatusOK {
		t.Fatalf("statuses = %d, %d; want 200, 200", firstStatus, secondStatus)
	}
	if firstBody != secondBody {
		t.Fatalf("replayed body %q differs from original %q", secondBody, firstBody)
	}
	if !strings.Contains(contentType, "application/json") {
		t.Fatalf("replay content-type = %q, want JSON", contentType)
	}
	if got := fixture.counts.rows["g1"]["user-2"]; got != 1 {
		t.Fatalf("count = %d, want 1: the tap ran more than once", got)
	}
}

func TestIdempotentCountPassesThroughWithoutKey(t *testing.T) {
	fixture := newIdempotencyFixture(&fakeIdempotencyStore{rows: map[string]storedIdempotencyRow{}})
	target := "/api/v1/groups/g1/members/user-2/increment"

	tapCount(t, fixture.app, target, "user-1", "")
	tapCount(t, fixture.app, target, "user-1", "")

	if got := fixture.counts.rows["g1"]["user-2"]; got != 2 {
		t.Fatalf("count = %d, want 2", got)
	}
}

func TestIdempotentCountScopesReplay(t *testing.T) {
	fixture := newIdempotencyFixture(&fakeIdempotencyStore{rows: map[string]storedIdempotencyRow{}})

	tapCount(t, fixture.app, "/api/v1/groups/g1/members/user-2/increment", "user-1", "key-1")
	tapCount(t, fixture.app, "/api/v1/groups/g1/members/user-1/increment", "user-1", "key-1")
	tapCount(t, fixture.app, "/api/v1/groups/g1/members/user-2/increment", "user-1", "key-2")

	if got := fixture.counts.rows["g1"]["user-2"]; got != 2 {
		t.Fatalf("user-2 count = %d, want 2", got)
	}
	if got := fixture.counts.rows["g1"]["user-1"]; got != 1 {
		t.Fatalf("user-1 count = %d, want 1", got)
	}
}

func TestIdempotentCountDoesNotStoreErrors(t *testing.T) {
	fixture := newIdempotencyFixture(&fakeIdempotencyStore{rows: map[string]storedIdempotencyRow{}})
	target := "/api/v1/groups/g1/members/user-9/increment"

	if status, _, _ := tapCount(t, fixture.app, target, "user-1", "key-1"); status != fiber.StatusNotFound {
		t.Fatalf("status = %d, want 404", status)
	}
	fixture.groups.members["g1"]["user-9"] = group.Member{AuthUserID: "user-9", DisplayName: "User Nine"}

	status, body, _ := tapCount(t, fixture.app, target, "user-1", "key-1")
	if status != fiber.StatusOK || !strings.Contains(body, `"count":1`) {
		t.Fatalf("status = %d, body = %s; want the re-executed 200 with count 1", status, body)
	}
}

func TestIdempotentCountFailsOpenOnStoreErrors(t *testing.T) {
	fixture := newIdempotencyFixture(&fakeIdempotencyStore{
		rows:   map[string]storedIdempotencyRow{},
		getErr: errors.New("store down"),
	})
	target := "/api/v1/groups/g1/members/user-2/increment"

	status, body, _ := tapCount(t, fixture.app, target, "user-1", "key-1")

	if status != fiber.StatusOK || !strings.Contains(body, `"count":1`) {
		t.Fatalf("status = %d, body = %s; want the tap to proceed", status, body)
	}
}

func TestIdempotentCountWithoutStorePassesThrough(t *testing.T) {
	fixture := newIdempotencyFixture(nil)
	target := "/api/v1/groups/g1/members/user-2/increment"

	tapCount(t, fixture.app, target, "user-1", "key-1")
	tapCount(t, fixture.app, target, "user-1", "key-1")

	if got := fixture.counts.rows["g1"]["user-2"]; got != 2 {
		t.Fatalf("count = %d, want 2", got)
	}
}
