package counter

import (
	"context"
	"errors"
)

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) GetCount(ctx context.Context, authUserID string) (int, error) {
	found, err := s.repository.Get(ctx, authUserID)
	if errors.Is(err, ErrNotFound) {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}
	return found.Count, nil
}

func (s *Service) Increment(ctx context.Context, authUserID string) (int, error) {
	updated, err := s.repository.Increment(ctx, authUserID)
	if err != nil {
		return 0, err
	}
	return updated.Count, nil
}
