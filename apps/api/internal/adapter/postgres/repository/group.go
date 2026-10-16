package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/mnemoraorg/yappi/apps/api/ent"
	"github.com/mnemoraorg/yappi/apps/api/ent/group"
	"github.com/mnemoraorg/yappi/apps/api/ent/groupmember"
	domaingroup "github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
)

type Group struct {
	client *ent.Client
}

func NewGroup(client *ent.Client) *Group {
	return &Group{client: client}
}

func (r *Group) CreateGroup(
	ctx context.Context,
	params domaingroup.NewGroup,
) (domaingroup.Group, error) {
	transaction, err := r.client.Tx(ctx)
	if err != nil {
		return domaingroup.Group{}, err
	}
	created, err := transaction.Group.Create().
		SetName(params.Name).
		SetPhrase(params.Phrase).
		SetInviteCode(params.InviteCode).
		SetCreatedBy(params.CreatedBy).
		Save(ctx)
	if err != nil {
		_ = transaction.Rollback()
		if ent.IsConstraintError(err) {
			return domaingroup.Group{}, domaingroup.ErrCodeTaken
		}
		return domaingroup.Group{}, err
	}
	if err := transaction.GroupMember.Create().
		SetGroupID(created.ID.String()).
		SetAuthUserID(params.CreatedBy).
		SetDisplayName(params.CreatorDisplay).
		Exec(ctx); err != nil {
		_ = transaction.Rollback()
		return domaingroup.Group{}, err
	}
	if err := transaction.Commit(); err != nil {
		return domaingroup.Group{}, err
	}
	return mapGroup(created), nil
}

func (r *Group) GetGroup(ctx context.Context, groupID string) (domaingroup.Group, error) {
	id, err := uuid.Parse(groupID)
	if err != nil {
		return domaingroup.Group{}, domaingroup.ErrNotFound
	}
	row, err := r.client.Group.Get(ctx, id)
	if ent.IsNotFound(err) {
		return domaingroup.Group{}, domaingroup.ErrNotFound
	}
	if err != nil {
		return domaingroup.Group{}, err
	}
	return mapGroup(row), nil
}

func (r *Group) ListGroupsForUser(
	ctx context.Context,
	authUserID string,
) ([]domaingroup.GroupSummary, error) {
	memberships, err := r.client.GroupMember.Query().
		Where(groupmember.AuthUserIDEQ(authUserID)).
		All(ctx)
	if err != nil {
		return nil, err
	}
	ids := make([]uuid.UUID, 0, len(memberships))
	groupIDs := make([]string, 0, len(memberships))
	for _, membership := range memberships {
		id, err := uuid.Parse(membership.GroupID)
		if err != nil {
			continue
		}
		ids = append(ids, id)
		groupIDs = append(groupIDs, membership.GroupID)
	}
	if len(ids) == 0 {
		return []domaingroup.GroupSummary{}, nil
	}
	rows, err := r.client.Group.Query().
		Where(group.IDIn(ids...)).
		Order(group.ByCreatedAt()).
		All(ctx)
	if err != nil {
		return nil, err
	}
	memberRows, err := r.client.GroupMember.Query().
		Where(groupmember.GroupIDIn(groupIDs...)).
		All(ctx)
	if err != nil {
		return nil, err
	}
	found := make([]domaingroup.GroupSummary, 0, len(rows))
	groupIndexes := make(map[string]int, len(rows))
	for _, row := range rows {
		groupID := row.ID.String()
		groupIndexes[groupID] = len(found)
		found = append(found, domaingroup.GroupSummary{
			Group:   mapGroup(row),
			Members: []domaingroup.GroupMemberPreview{},
		})
	}
	for _, row := range memberRows {
		index, ok := groupIndexes[row.GroupID]
		if !ok {
			continue
		}
		name := row.DisplayName
		if name == "" {
			name = row.AuthUserID
		}
		found[index].Members = append(found[index].Members, domaingroup.GroupMemberPreview{
			AuthUserID:  row.AuthUserID,
			DisplayName: name,
		})
	}
	return found, nil
}

func (r *Group) FindGroupByCode(ctx context.Context, code string) (domaingroup.Group, error) {
	row, err := r.client.Group.Query().
		Where(group.InviteCodeEQ(code)).
		Only(ctx)
	if ent.IsNotFound(err) {
		return domaingroup.Group{}, domaingroup.ErrNotFound
	}
	if err != nil {
		return domaingroup.Group{}, err
	}
	return mapGroup(row), nil
}

func (r *Group) AddMember(
	ctx context.Context,
	groupID string,
	member domaingroup.Member,
) error {
	err := r.client.GroupMember.Create().
		SetGroupID(groupID).
		SetAuthUserID(member.AuthUserID).
		SetDisplayName(member.DisplayName).
		Exec(ctx)
	if ent.IsConstraintError(err) {
		return nil
	}
	return err
}

func (r *Group) ListMembers(
	ctx context.Context,
	groupID string,
) ([]domaingroup.Member, error) {
	rows, err := r.client.GroupMember.Query().
		Where(groupmember.GroupIDEQ(groupID)).
		All(ctx)
	if err != nil {
		return nil, err
	}
	members := make([]domaingroup.Member, 0, len(rows))
	for _, row := range rows {
		name := row.DisplayName
		if name == "" {
			name = row.AuthUserID
		}
		members = append(members, domaingroup.Member{AuthUserID: row.AuthUserID, DisplayName: name})
	}
	return members, nil
}

func (r *Group) IsMember(ctx context.Context, groupID, authUserID string) (bool, error) {
	return r.client.GroupMember.Query().
		Where(groupmember.GroupIDEQ(groupID), groupmember.AuthUserIDEQ(authUserID)).
		Exist(ctx)
}

func mapGroup(row *ent.Group) domaingroup.Group {
	return domaingroup.Group{
		ID:         row.ID.String(),
		Name:       row.Name,
		Phrase:     row.Phrase,
		InviteCode: row.InviteCode,
		CreatedBy:  row.CreatedBy,
	}
}
