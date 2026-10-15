package service

import (
	"context"
	"sort"

	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
)

func (s *Service) ListGroups(ctx context.Context, callerID string) ([]group.GroupSummary, error) {
	if err := group.ValidateUserID(callerID); err != nil {
		return nil, err
	}
	found, err := s.groups.ListGroupsForUser(ctx, callerID)
	if err != nil {
		return nil, err
	}
	for i := range found {
		for j := range found[i].Members {
			found[i].Members[j].You = found[i].Members[j].AuthUserID == callerID
		}
		sort.Slice(found[i].Members, func(a, b int) bool {
			left, right := found[i].Members[a], found[i].Members[b]
			if left.You != right.You {
				return left.You
			}
			if left.DisplayName != right.DisplayName {
				return left.DisplayName < right.DisplayName
			}
			return left.AuthUserID < right.AuthUserID
		})
	}
	return found, nil
}
