package service

import (
	"context"

	"github.com/mnemoraorg/yappi/apps/api/internal/domain/counter"
)

func (s *Service) Decrement(ctx context.Context, authUserID string) (int, error) {
	if err := counter.ValidateUserID(authUserID); err != nil {
		return 0, err
	}
	updated, err := s.repository.Decrement(ctx, authUserID)
	if err != nil {
		return 0, err
	}
	return updated.Count, nil
}
