package service

import (
	"context"
	"errors"

	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
)

func (s *Service) CreateGroup(
	ctx context.Context,
	callerID, displayName, name, phrase string,
) (group.Group, error) {
	if err := group.ValidateUserID(callerID); err != nil {
		return group.Group{}, err
	}
	if err := group.ValidateNewGroup(name, phrase); err != nil {
		return group.Group{}, err
	}

	for range 3 {
		created, err := s.groups.CreateGroup(ctx, group.NewGroup{
			Name:           name,
			Phrase:         phrase,
			InviteCode:     group.GenerateInviteCode(),
			CreatedBy:      callerID,
			CreatorDisplay: displayName,
		})
		if errors.Is(err, group.ErrCodeTaken) {
			continue
		}
		return created, err
	}
	return group.Group{}, group.ErrCodeTaken
}
