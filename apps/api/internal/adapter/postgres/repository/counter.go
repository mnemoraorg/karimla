package repository

import (
	"context"

	"github.com/mnemoraorg/karimla/apps/api/ent"
	counterent "github.com/mnemoraorg/karimla/apps/api/ent/counter"
	"github.com/mnemoraorg/karimla/apps/api/internal/domain/counter"
)

type Counter struct {
	client *ent.Client
}

func NewCounter(client *ent.Client) *Counter {
	return &Counter{client: client}
}

func (r *Counter) Get(ctx context.Context, authUserID string) (counter.Counter, error) {
	row, err := r.client.Counter.Get(ctx, authUserID)
	if ent.IsNotFound(err) {
		return counter.Counter{}, counter.ErrNotFound
	}
	if err != nil {
		return counter.Counter{}, err
	}
	return counter.Counter{AuthUserID: row.ID, Count: row.Count}, nil
}

func (r *Counter) Decrement(ctx context.Context, authUserID string) (counter.Counter, error) {
	updated, err := r.client.Counter.Update().
		Where(counterent.IDEQ(authUserID), counterent.CountGT(0)).
		AddCount(-1).
		Save(ctx)
	if err != nil {
		return counter.Counter{}, err
	}
	if updated > 0 {
		return r.Get(ctx, authUserID)
	}
	return counter.Counter{AuthUserID: authUserID}, nil
}

func (r *Counter) Increment(ctx context.Context, authUserID string) (counter.Counter, error) {
	updated, err := r.client.Counter.Update().
		Where(counterent.IDEQ(authUserID)).
		AddCount(1).
		Save(ctx)
	if err != nil {
		return counter.Counter{}, err
	}
	if updated > 0 {
		return r.Get(ctx, authUserID)
	}

	created, err := r.client.Counter.Create().
		SetID(authUserID).
		SetCount(1).
		Save(ctx)
	if ent.IsConstraintError(err) {
		return r.Get(ctx, authUserID)
	}
	if err != nil {
		return counter.Counter{}, err
	}
	return counter.Counter{AuthUserID: created.ID, Count: created.Count}, nil
}
