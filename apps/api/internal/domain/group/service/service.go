package service

import (
	"context"

	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
)

type Service struct {
	groups group.Repository
	counts group.CountRepository
}

func NewService(groups group.Repository, counts group.CountRepository) *Service {
	return &Service{groups: groups, counts: counts}
}

func (s *Service) checkMemberPair(
	ctx context.Context,
	callerID, groupID, targetID string,
) error {
	if err := group.ValidateUserID(callerID); err != nil {
		return err
	}
	if err := group.ValidateUserID(targetID); err != nil {
		return err
	}
	if groupID == "" {
		return group.ErrInvalidInput
	}

	callerMember, err := s.groups.IsMember(ctx, groupID, callerID)
	if err != nil {
		return err
	}
	if !callerMember {
		return group.ErrNotMember
	}
	targetMember, err := s.groups.IsMember(ctx, groupID, targetID)
	if err != nil {
		return err
	}
	if !targetMember {
		return group.ErrNotFound
	}
	return nil
}
