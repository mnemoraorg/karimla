package idempotency

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
)

// HeaderName carries the client operation key. Count taps stamp one UUID per
// tap so a retried request replays instead of counting again.
const HeaderName = "Idempotency-Key"

// StoredResponse is a previously completed answer, replayed byte-for-byte.
type StoredResponse struct {
	Status int
	Body   []byte
}

// Store keeps completed responses by operation key. Implementations must be
// safe for concurrent use; Fiber serves requests on many goroutines.
type Store interface {
	FindResponse(ctx context.Context, key, endpoint, authUserID string) (StoredResponse, bool, error)
	SaveResponse(ctx context.Context, key, endpoint, authUserID string, response StoredResponse) error
	PurgeExpired(ctx context.Context) (int, error)
}

// Require replays the stored response for a repeated key and stores successful
// answers for future replays. Requests without a key pass through untouched,
// and every store failure fails open: a missing cache must never fail a
// count. Only 2xx answers are stored, so retrying a failed tap with the same
// key re-executes it.
//
// Retries are sequential (one in-flight request per key), so concurrent
// duplicates are not serialized here: two simultaneous same-key requests both
// execute, and the first completed answer wins the stored slot.
func Require(store Store) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if store == nil {
			return c.Next()
		}
		key := strings.TrimSpace(c.Get(HeaderName))
		if key == "" {
			return c.Next()
		}
		// Clone what crosses into retained storage: Fiber may hand out header
		// and route values that alias recycled request buffers, so a stored
		// key must own its bytes before it outlives this request.
		key = strings.Clone(key)
		authUserID := strings.Clone(authmiddleware.Principal(c).AuthUserID)
		if authUserID == "" {
			return c.Next()
		}
		endpoint := c.Method() + " " + c.Path()
		if stored, found, err := store.FindResponse(c.UserContext(), key, endpoint, authUserID); err == nil && found {
			c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSON)
			return c.Status(stored.Status).Send(stored.Body)
		}
		if err := c.Next(); err != nil {
			return err
		}
		status := c.Response().StatusCode()
		if status >= 200 && status < 300 {
			body := append([]byte(nil), c.Response().Body()...)
			_ = store.SaveResponse(c.UserContext(), key, endpoint, authUserID, StoredResponse{Status: status, Body: body})
		}
		return nil
	}
}
