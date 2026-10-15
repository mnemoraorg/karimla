package service

import (
	"context"
	"errors"

	"github.com/mnemoraorg/yappi/apps/api/internal/domain/counter"
)

func (s *Service) GetCount(ctx context.Context, authUserID string) (int, error) {
	if err := counter.ValidateUserID(authUserID); err != nil {
		return 0, err
	}
	found, err := s.repository.Get(ctx, authUserID)
	if errors.Is(err, counter.ErrNotFound) {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}
	return found.Count, nil
}
