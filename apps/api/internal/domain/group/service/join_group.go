package service

import (
	"context"

	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
)

func (s *Service) JoinGroup(
	ctx context.Context,
	callerID, displayName, code string,
) (group.Group, error) {
	if err := group.ValidateUserID(callerID); err != nil {
		return group.Group{}, err
	}
	if err := group.ValidateInviteCode(code); err != nil {
		return group.Group{}, err
	}

	found, err := s.groups.FindGroupByCode(ctx, code)
	if err != nil {
		return group.Group{}, err
	}
	if err := s.groups.AddMember(ctx, found.ID, group.Member{
		AuthUserID:  callerID,
		DisplayName: displayName,
	}); err != nil {
		return group.Group{}, err
	}
	return found, nil
}
