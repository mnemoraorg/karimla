package group

import (
	"context"
	"errors"
)

var ErrNotFound = errors.New("group not found")

var ErrNotMember = errors.New("not a group member")

var ErrInvalidInput = errors.New("invalid group input")

var ErrCodeTaken = errors.New("invite code taken")

type Group struct {
	ID         string
	Name       string
	Phrase     string
	InviteCode string
	CreatedBy  string
}

type Member struct {
	AuthUserID  string
	DisplayName string
}

type MemberCount struct {
	AuthUserID  string
	DisplayName string
	Count       int
	You         bool
}

type GroupDetail struct {
	Group   Group
	Members []MemberCount
}

type NewGroup struct {
	Name            string
	Phrase          string
	InviteCode      string
	CreatedBy       string
	CreatorDisplay  string
}

type Repository interface {
	CreateGroup(ctx context.Context, params NewGroup) (Group, error)
	GetGroup(ctx context.Context, groupID string) (Group, error)
	ListGroupsForUser(ctx context.Context, authUserID string) ([]Group, error)
	FindGroupByCode(ctx context.Context, code string) (Group, error)
	AddMember(ctx context.Context, groupID string, member Member) error
	ListMembers(ctx context.Context, groupID string) ([]Member, error)
	IsMember(ctx context.Context, groupID, authUserID string) (bool, error)
}

type CountRepository interface {
	GetCount(ctx context.Context, groupID, authUserID string) (int, error)
	ListCounts(ctx context.Context, groupID string) (map[string]int, error)
	Increment(ctx context.Context, groupID, authUserID string) (int, error)
	Decrement(ctx context.Context, groupID, authUserID string) (int, error)
}
