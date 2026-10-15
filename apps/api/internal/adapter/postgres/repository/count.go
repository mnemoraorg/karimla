package repository

import (
	"context"

	"github.com/mnemoraorg/yappi/apps/api/ent"
	groupcountent "github.com/mnemoraorg/yappi/apps/api/ent/groupcount"
)

type Count struct {
	client *ent.Client
}

func NewCount(client *ent.Client) *Count {
	return &Count{client: client}
}

func (r *Count) GetCount(ctx context.Context, groupID, authUserID string) (int, error) {
	row, err := r.client.GroupCount.Query().
		Where(groupcountent.GroupIDEQ(groupID), groupcountent.AuthUserIDEQ(authUserID)).
		Only(ctx)
	if ent.IsNotFound(err) {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}
	return row.Count, nil
}

func (r *Count) ListCounts(ctx context.Context, groupID string) (map[string]int, error) {
	rows, err := r.client.GroupCount.Query().
		Where(groupcountent.GroupIDEQ(groupID)).
		All(ctx)
	if err != nil {
		return nil, err
	}
	counts := make(map[string]int, len(rows))
	for _, row := range rows {
		counts[row.AuthUserID] = row.Count
	}
	return counts, nil
}

func (r *Count) Increment(ctx context.Context, groupID, authUserID string) (int, error) {
	updated, err := r.client.GroupCount.Update().
		Where(groupcountent.GroupIDEQ(groupID), groupcountent.AuthUserIDEQ(authUserID)).
		AddCount(1).
		Save(ctx)
	if err != nil {
		return 0, err
	}
	if updated > 0 {
		return r.GetCount(ctx, groupID, authUserID)
	}

	created, err := r.client.GroupCount.Create().
		SetGroupID(groupID).
		SetAuthUserID(authUserID).
		SetCount(1).
		Save(ctx)
	if ent.IsConstraintError(err) {
		return r.GetCount(ctx, groupID, authUserID)
	}
	if err != nil {
		return 0, err
	}
	return created.Count, nil
}

func (r *Count) Decrement(ctx context.Context, groupID, authUserID string) (int, error) {
	updated, err := r.client.GroupCount.Update().
		Where(
			groupcountent.GroupIDEQ(groupID),
			groupcountent.AuthUserIDEQ(authUserID),
			groupcountent.CountGT(0),
		).
		AddCount(-1).
		Save(ctx)
	if err != nil {
		return 0, err
	}
	if updated > 0 {
		return r.GetCount(ctx, groupID, authUserID)
	}
	return 0, nil
}
