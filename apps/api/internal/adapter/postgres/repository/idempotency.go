package repository

import (
	"context"
	"time"

	entclient "github.com/mnemoraorg/yappi/apps/api/ent"
	"github.com/mnemoraorg/yappi/apps/api/ent/idempotencykey"
	idempotency "github.com/mnemoraorg/yappi/apps/api/internal/middleware/idempotency"
)

// ResponseTTL bounds how long a stored answer is replayed. A key is only ever
// retried while its tap is unsettled, so days of retention are plenty; the
// application purges older rows on a ticker.
const ResponseTTL = 72 * time.Hour

// Idempotency stores completed count answers in PostgreSQL.
type Idempotency struct {
	client *entclient.Client
}

// NewIdempotency returns the Postgres-backed idempotency store.
func NewIdempotency(client *entclient.Client) *Idempotency {
	return &Idempotency{client: client}
}

func (r *Idempotency) FindResponse(
	ctx context.Context,
	key, endpoint, authUserID string,
) (idempotency.StoredResponse, bool, error) {
	row, err := r.client.IdempotencyKey.Query().
		Where(
			idempotencykey.KeyID(key),
			idempotencykey.Endpoint(endpoint),
			idempotencykey.AuthUserID(authUserID),
		).
		Only(ctx)
	if entclient.IsNotFound(err) {
		return idempotency.StoredResponse{}, false, nil
	}
	if err != nil {
		return idempotency.StoredResponse{}, false, err
	}
	if time.Since(row.CreatedAt) > ResponseTTL {
		_ = r.client.IdempotencyKey.DeleteOneID(row.ID).Exec(ctx)
		return idempotency.StoredResponse{}, false, nil
	}
	return idempotency.StoredResponse{Status: row.StatusCode, Body: row.Body}, true, nil
}

func (r *Idempotency) SaveResponse(
	ctx context.Context,
	key, endpoint, authUserID string,
	response idempotency.StoredResponse,
) error {
	err := r.client.IdempotencyKey.Create().
		SetKeyID(key).
		SetEndpoint(endpoint).
		SetAuthUserID(authUserID).
		SetStatusCode(response.Status).
		SetBody(response.Body).
		Exec(ctx)
	if entclient.IsConstraintError(err) {
		return nil
	}
	return err
}

func (r *Idempotency) PurgeExpired(ctx context.Context) (int, error) {
	return r.client.IdempotencyKey.Delete().
		Where(idempotencykey.CreatedAtLT(time.Now().Add(-ResponseTTL))).
		Exec(ctx)
}
