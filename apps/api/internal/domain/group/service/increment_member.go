package service

import (
	"context"
)

func (s *Service) IncrementMember(
	ctx context.Context,
	callerID, groupID, targetID string,
) (int, error) {
	if err := s.checkMemberPair(ctx, callerID, groupID, targetID); err != nil {
		return 0, err
	}
	return s.counts.Increment(ctx, groupID, targetID)
}
