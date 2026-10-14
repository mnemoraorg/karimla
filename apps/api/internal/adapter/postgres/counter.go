package postgres

import (
	"context"

	"github.com/mnemoraorg/karimla/apps/api/ent"
	counterent "github.com/mnemoraorg/karimla/apps/api/ent/counter"
	"github.com/mnemoraorg/karimla/apps/api/internal/domain/counter"
)

func (s *Store) Get(ctx context.Context, authUserID string) (counter.Counter, error) {
	row, err := s.ent.Counter.Get(ctx, authUserID)
	if ent.IsNotFound(err) {
		return counter.Counter{}, counter.ErrNotFound
	}
	if err != nil {
		return counter.Counter{}, err
	}
	return counter.Counter{AuthUserID: row.ID, Count: row.Count}, nil
}

func (s *Store) Increment(ctx context.Context, authUserID string) (counter.Counter, error) {
	updated, err := s.ent.Counter.Update().
		Where(counterent.IDEQ(authUserID)).
		AddCount(1).
		Save(ctx)
	if err != nil {
		return counter.Counter{}, err
	}
	if updated > 0 {
		return s.Get(ctx, authUserID)
	}

	created, err := s.ent.Counter.Create().
		SetID(authUserID).
		SetCount(1).
		Save(ctx)
	if ent.IsConstraintError(err) {
		return s.Get(ctx, authUserID)
	}
	if err != nil {
		return counter.Counter{}, err
	}
	return counter.Counter{AuthUserID: created.ID, Count: created.Count}, nil
}
