package service

import (
	"context"

	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
)

func (s *Service) ListGroups(ctx context.Context, callerID string) ([]group.Group, error) {
	if err := group.ValidateUserID(callerID); err != nil {
		return nil, err
	}
	return s.groups.ListGroupsForUser(ctx, callerID)
}
