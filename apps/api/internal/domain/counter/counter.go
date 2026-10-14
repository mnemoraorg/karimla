package counter

import (
	"context"
	"errors"
)

var ErrNotFound = errors.New("counter not found")

var ErrInvalidInput = errors.New("invalid counter input")

type Counter struct {
	AuthUserID string
	Count      int
}

type Repository interface {
	Get(ctx context.Context, authUserID string) (Counter, error)
	Increment(ctx context.Context, authUserID string) (Counter, error)
	Decrement(ctx context.Context, authUserID string) (Counter, error)
}
