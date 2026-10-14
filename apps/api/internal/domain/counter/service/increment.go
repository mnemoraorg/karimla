package service

import "context"

func (s *Service) Increment(ctx context.Context, authUserID string) (int, error) {
	updated, err := s.repository.Increment(ctx, authUserID)
	if err != nil {
		return 0, err
	}
	return updated.Count, nil
}
