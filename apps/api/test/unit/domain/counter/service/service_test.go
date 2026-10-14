package service_test

import (
	"context"
	"testing"

	"github.com/mnemoraorg/karimla/apps/api/internal/domain/counter"
	counterservice "github.com/mnemoraorg/karimla/apps/api/internal/domain/counter/service"
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

func TestGetCountDefaultsMissingUsersToZero(t *testing.T) {
	service := counterservice.NewService(&fakeRepository{rows: map[string]int{}})

	count, err := service.GetCount(context.Background(), "user-1")
	if err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Fatalf("count = %d, want 0", count)
	}
}

func TestIncrementStartsNewCountersAtOne(t *testing.T) {
	service := counterservice.NewService(&fakeRepository{rows: map[string]int{"user-1": 41}})

	first, err := service.Increment(context.Background(), "user-1")
	if err != nil {
		t.Fatal(err)
	}
	if first != 42 {
		t.Fatalf("count = %d, want 42", first)
	}

	fresh, err := service.Increment(context.Background(), "user-2")
	if err != nil {
		t.Fatal(err)
	}
	if fresh != 1 {
		t.Fatalf("count = %d, want 1", fresh)
	}
}

func TestDecrementFloorsMissingAndZeroCountersAtZero(t *testing.T) {
	service := counterservice.NewService(&fakeRepository{rows: map[string]int{"user-1": 41}})

	down, err := service.Decrement(context.Background(), "user-1")
	if err != nil {
		t.Fatal(err)
	}
	if down != 40 {
		t.Fatalf("count = %d, want 40", down)
	}

	missing, err := service.Decrement(context.Background(), "user-2")
	if err != nil {
		t.Fatal(err)
	}
	if missing != 0 {
		t.Fatalf("count = %d, want 0", missing)
	}

	floor, err := service.Decrement(context.Background(), "user-2")
	if err != nil {
		t.Fatal(err)
	}
	if floor != 0 {
		t.Fatalf("count = %d, want 0", floor)
	}
}
