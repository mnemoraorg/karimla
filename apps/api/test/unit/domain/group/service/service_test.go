package service_test

import (
	"context"
	"errors"
	"testing"

	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
	groupservice "github.com/mnemoraorg/yappi/apps/api/internal/domain/group/service"
)

type fakeGroups struct {
	groups  map[string]group.Group
	members map[string]map[string]group.Member
	byCode  map[string]string
}

func (f *fakeGroups) CreateGroup(
	_ context.Context,
	params group.NewGroup,
) (group.Group, error) {
	for _, existing := range f.groups {
		if existing.InviteCode == params.InviteCode {
			return group.Group{}, group.ErrCodeTaken
		}
	}
	created := group.Group{
		ID:         "group-1",
		Name:       params.Name,
		Phrase:     params.Phrase,
		InviteCode: params.InviteCode,
		CreatedBy:  params.CreatedBy,
	}
	f.groups[created.ID] = created
	f.byCode[created.InviteCode] = created.ID
	f.members[created.ID] = map[string]group.Member{params.CreatedBy: {AuthUserID: params.CreatedBy}}
	return created, nil
}

func (f *fakeGroups) GetGroup(_ context.Context, groupID string) (group.Group, error) {
	found, ok := f.groups[groupID]
	if !ok {
		return group.Group{}, group.ErrNotFound
	}
	return found, nil
}

func (f *fakeGroups) ListGroupsForUser(
	_ context.Context,
	authUserID string,
) ([]group.Group, error) {
	var found []group.Group
	for id, members := range f.members {
		if _, ok := members[authUserID]; ok {
			found = append(found, f.groups[id])
		}
	}
	return found, nil
}

func (f *fakeGroups) FindGroupByCode(_ context.Context, code string) (group.Group, error) {
	id, ok := f.byCode[code]
	if !ok {
		return group.Group{}, group.ErrNotFound
	}
	return f.groups[id], nil
}

func (f *fakeGroups) AddMember(
	_ context.Context,
	groupID string,
	member group.Member,
) error {
	if _, ok := f.groups[groupID]; !ok {
		return group.ErrNotFound
	}
	if f.members[groupID] == nil {
		f.members[groupID] = map[string]group.Member{}
	}
	f.members[groupID][member.AuthUserID] = member
	return nil
}

func (f *fakeGroups) ListMembers(
	_ context.Context,
	groupID string,
) ([]group.Member, error) {
	var members []group.Member
	for _, member := range f.members[groupID] {
		members = append(members, member)
	}
	return members, nil
}

func (f *fakeGroups) IsMember(_ context.Context, groupID, authUserID string) (bool, error) {
	_, ok := f.members[groupID][authUserID]
	return ok, nil
}

type fakeCounts struct {
	rows map[string]map[string]int
}

func (f *fakeCounts) GetCount(_ context.Context, groupID, authUserID string) (int, error) {
	return f.rows[groupID][authUserID], nil
}

func (f *fakeCounts) ListCounts(_ context.Context, groupID string) (map[string]int, error) {
	out := map[string]int{}
	for user, count := range f.rows[groupID] {
		out[user] = count
	}
	return out, nil
}

func (f *fakeCounts) Increment(_ context.Context, groupID, authUserID string) (int, error) {
	if f.rows[groupID] == nil {
		f.rows[groupID] = map[string]int{}
	}
	f.rows[groupID][authUserID] = f.rows[groupID][authUserID] + 1
	return f.rows[groupID][authUserID], nil
}

func (f *fakeCounts) Decrement(_ context.Context, groupID, authUserID string) (int, error) {
	if f.rows[groupID][authUserID] > 0 {
		f.rows[groupID][authUserID] = f.rows[groupID][authUserID] - 1
	}
	return f.rows[groupID][authUserID], nil
}

func newService() *groupservice.Service {
	return groupservice.NewService(
		&fakeGroups{
			groups:  map[string]group.Group{},
			members: map[string]map[string]group.Member{},
			byCode:  map[string]string{},
		},
		&fakeCounts{rows: map[string]map[string]int{}},
	)
}

func TestCreateGroupRejectsBlankNameAndPhrase(t *testing.T) {
	service := newService()

	if _, err := service.CreateGroup(context.Background(), "user-1", "User", "", "karimla"); err == nil {
		t.Fatal("expected an error for a blank name")
	}
	if _, err := service.CreateGroup(context.Background(), "user-1", "User", "Crew", ""); err == nil {
		t.Fatal("expected an error for a blank phrase")
	}
}

func TestJoinUnknownCodeReturnsNotFound(t *testing.T) {
	service := newService()

	if _, err := service.JoinGroup(context.Background(), "user-1", "User", "ABCDEFGH"); !errors.Is(err, group.ErrNotFound) {
		t.Fatalf("err = %v, want ErrNotFound", err)
	}
}

func TestMemberCountingRequiresMembershipBothWays(t *testing.T) {
	service := newService()
	ctx := context.Background()

	created, err := service.CreateGroup(ctx, "user-1", "User One", "Crew", "karimla")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := service.JoinGroup(ctx, "user-2", "User Two", created.InviteCode); err != nil {
		t.Fatal(err)
	}

	if _, err := service.IncrementMember(ctx, "stranger", created.ID, "user-1"); !errors.Is(err, group.ErrNotMember) {
		t.Fatalf("err = %v, want ErrNotMember", err)
	}
	if _, err := service.IncrementMember(ctx, "user-1", created.ID, "stranger"); !errors.Is(err, group.ErrNotFound) {
		t.Fatalf("err = %v, want ErrNotFound", err)
	}
	if count, err := service.IncrementMember(ctx, "user-1", created.ID, "user-2"); err != nil || count != 1 {
		t.Fatalf("count = %d, err = %v, want 1, nil", count, err)
	}
	if count, err := service.DecrementMember(ctx, "user-2", created.ID, "user-2"); err != nil || count != 0 {
		t.Fatalf("count = %d, err = %v, want 0, nil", count, err)
	}
}

func TestGroupDetailSortsByCountAndMarksYou(t *testing.T) {
	service := newService()
	ctx := context.Background()

	created, err := service.CreateGroup(ctx, "user-1", "User One", "Crew", "karimla")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := service.JoinGroup(ctx, "user-2", "User Two", created.InviteCode); err != nil {
		t.Fatal(err)
	}
	if _, err := service.IncrementMember(ctx, "user-1", created.ID, "user-2"); err != nil {
		t.Fatal(err)
	}
	if _, err := service.IncrementMember(ctx, "user-1", created.ID, "user-2"); err != nil {
		t.Fatal(err)
	}

	detail, err := service.GetGroupDetail(ctx, "user-1", created.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(detail.Members) != 2 {
		t.Fatalf("members = %d, want 2", len(detail.Members))
	}
	if detail.Members[0].AuthUserID != "user-2" || detail.Members[0].Count != 2 || detail.Members[0].You {
		t.Fatalf("first = %+v, want user-2 with 2 and You false", detail.Members[0])
	}
	if detail.Members[1].AuthUserID != "user-1" || !detail.Members[1].You {
		t.Fatalf("second = %+v, want user-1 with You true", detail.Members[1])
	}
}
