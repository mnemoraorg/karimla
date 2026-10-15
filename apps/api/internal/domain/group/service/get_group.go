package service

import (
	"context"
	"sort"

	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
)

func (s *Service) GetGroupDetail(
	ctx context.Context,
	callerID, groupID string,
) (group.GroupDetail, error) {
	if err := group.ValidateUserID(callerID); err != nil {
		return group.GroupDetail{}, err
	}
	if groupID == "" {
		return group.GroupDetail{}, group.ErrInvalidInput
	}

	found, err := s.groups.GetGroup(ctx, groupID)
	if err != nil {
		return group.GroupDetail{}, err
	}
	member, err := s.groups.IsMember(ctx, groupID, callerID)
	if err != nil {
		return group.GroupDetail{}, err
	}
	if !member {
		return group.GroupDetail{}, group.ErrNotMember
	}

	members, err := s.groups.ListMembers(ctx, groupID)
	if err != nil {
		return group.GroupDetail{}, err
	}
	counts, err := s.counts.ListCounts(ctx, groupID)
	if err != nil {
		return group.GroupDetail{}, err
	}

	detail := group.GroupDetail{Group: found}
	for _, entry := range members {
		detail.Members = append(detail.Members, group.MemberCount{
			AuthUserID:  entry.AuthUserID,
			DisplayName: entry.DisplayName,
			Count:       counts[entry.AuthUserID],
			You:         entry.AuthUserID == callerID,
		})
	}
	sort.Slice(detail.Members, func(i, j int) bool {
		if detail.Members[i].Count == detail.Members[j].Count {
			return detail.Members[i].DisplayName < detail.Members[j].DisplayName
		}
		return detail.Members[i].Count > detail.Members[j].Count
	})
	return detail, nil
}
