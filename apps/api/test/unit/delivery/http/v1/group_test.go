package http_test

import (
	"context"
	"encoding/json"
	"io"
	"net/http/httptest"
	"strconv"
	"strings"
	"sync"
	"testing"

	"github.com/gofiber/fiber/v2"
	httpv1 "github.com/mnemoraorg/yappi/apps/api/internal/delivery/http/v1"
	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
	groupservice "github.com/mnemoraorg/yappi/apps/api/internal/domain/group/service"
	grouphandler "github.com/mnemoraorg/yappi/apps/api/internal/handler/api/group"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared"
)

type fakeGroups struct {
	mu      sync.Mutex
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
		Name:       strings.Clone(params.Name),
		Phrase:     strings.Clone(params.Phrase),
		InviteCode: strings.Clone(params.InviteCode),
		CreatedBy:  strings.Clone(params.CreatedBy),
	}
	f.groups[created.ID] = created
	f.byCode[created.InviteCode] = created.ID
	f.members[created.ID] = map[string]group.Member{
		params.CreatedBy: {AuthUserID: params.CreatedBy, DisplayName: strings.Clone(params.CreatorDisplay)},
	}
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
) ([]group.GroupSummary, error) {
	var found []group.GroupSummary
	for id, members := range f.members {
		if _, ok := members[authUserID]; !ok {
			continue
		}
		summary := group.GroupSummary{Group: f.groups[id]}
		for _, member := range members {
			summary.Members = append(summary.Members, group.GroupMemberPreview{
				AuthUserID:  member.AuthUserID,
				DisplayName: member.DisplayName,
			})
		}
		found = append(found, summary)
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
	groupID = strings.Clone(groupID)
	member.AuthUserID = strings.Clone(member.AuthUserID)
	member.DisplayName = strings.Clone(member.DisplayName)
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
	mu   sync.Mutex
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

type cookieValidator struct{}

func (cookieValidator) Validate(
	_ context.Context,
	cookie, _ string,
) (shared.Principal, bool, error) {
	user := strings.TrimPrefix(cookie, "user=")
	if user == "" || user == cookie {
		return shared.Principal{}, false, nil
	}
	return shared.Principal{AuthUserID: user, Email: user + "@example.com"}, true, nil
}

func groupRequest(t *testing.T, app *fiber.App, method, target, user, body string) (int, string) {
	t.Helper()
	var reader io.Reader
	if body != "" {
		reader = strings.NewReader(body)
	}
	request := httptest.NewRequest(method, target, reader)
	if body != "" {
		request.Header.Set("content-type", "application/json")
	}
	if user != "" {
		request.Header.Set("Cookie", "user="+user)
	}
	response, err := app.Test(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	payload, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatal(err)
	}
	return response.StatusCode, string(payload)
}

func TestGroupRoutesServeMembers(t *testing.T) {
	app := fiber.New()
	service := groupservice.NewService(
		&fakeGroups{
			groups:  map[string]group.Group{},
			members: map[string]map[string]group.Member{},
			byCode:  map[string]string{},
		},
		&fakeCounts{rows: map[string]map[string]int{}},
	)
	httpv1.Register(app.Group("/api"), httpv1.Dependencies{
		Groups: grouphandler.New(service),
		Auth:   cookieValidator{},
	})

	if status, _ := groupRequest(t, app, "GET", "/api/v1/groups", "", ""); status != fiber.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", status, fiber.StatusUnauthorized)
	}

	status, body := groupRequest(t, app, "POST", "/api/v1/groups", "user-1", `{"name":"Crew","phrase":"karimla"}`)
	if status != fiber.StatusCreated {
		t.Fatalf("status = %d, want %d (body %s)", status, fiber.StatusCreated, body)
	}
	var created struct {
		Data struct {
			ID         string `json:"id"`
			InviteCode string `json:"invite_code"`
		} `json:"data"`
	}
	if err := json.Unmarshal([]byte(body), &created); err != nil {
		t.Fatal(err)
	}
	if created.Data.ID == "" || created.Data.InviteCode == "" {
		t.Fatalf("body = %s, want id and invite_code", body)
	}

	joinTarget := "/api/v1/groups/join"
	if status, _ := groupRequest(t, app, "POST", joinTarget, "user-2", `{"code":"ZZZZ9999"}`); status != fiber.StatusNotFound {
		t.Fatalf("status = %d, want %d", status, fiber.StatusNotFound)
	}
	joinBody := `{"code":` + strconv.Quote(created.Data.InviteCode) + `}`
	if status, joinOut := groupRequest(t, app, "POST", joinTarget, "user-2", joinBody); status != fiber.StatusOK {
		t.Fatalf("status = %d, want %d (body %s)", status, fiber.StatusOK, joinOut)
	}
	if status, joinOut := groupRequest(t, app, "POST", joinTarget, "user-3", joinBody); status != fiber.StatusOK {
		t.Fatalf("status = %d, want %d (body %s)", status, fiber.StatusOK, joinOut)
	}

	status, listBody := groupRequest(t, app, "GET", "/api/v1/groups", "user-1", "")
	var listed struct {
		Data []struct {
			ID          string `json:"id"`
			MemberCount int    `json:"member_count"`
			Members     []struct {
				UserID string `json:"user_id"`
				You    bool   `json:"you"`
			} `json:"members"`
		} `json:"data"`
	}
	if status != fiber.StatusOK || json.Unmarshal([]byte(listBody), &listed) != nil {
		t.Fatalf("status = %d, body = %s, want groups with member previews", status, listBody)
	}
	if len(listed.Data) != 1 || listed.Data[0].MemberCount != 3 ||
		len(listed.Data[0].Members) != 2 || listed.Data[0].Members[0].UserID != "user-1" ||
		!listed.Data[0].Members[0].You {
		t.Fatalf("group list = %+v, want two previews out of three members with caller first", listed.Data)
	}

	incrementTarget := "/api/v1/groups/" + created.Data.ID + "/members/user-2/increment"
	if status, out := groupRequest(t, app, "POST", incrementTarget, "user-1", ""); status != fiber.StatusOK || !strings.Contains(out, `"count":1`) {
		t.Fatalf("status = %d, body = %s, want 200 with count 1", status, out)
	}
	if status, _ := groupRequest(t, app, "POST", incrementTarget, "stranger", ""); status != fiber.StatusForbidden {
		t.Fatalf("status = %d, want %d", status, fiber.StatusForbidden)
	}

	decrementTarget := "/api/v1/groups/" + created.Data.ID + "/members/user-2/decrement"
	if status, out := groupRequest(t, app, "POST", decrementTarget, "user-2", ""); status != fiber.StatusOK || !strings.Contains(out, `"count":0`) {
		t.Fatalf("status = %d, body = %s, want 200 with count 0", status, out)
	}

	if status, out := groupRequest(t, app, "GET", "/api/v1/groups/"+created.Data.ID, "user-1", ""); status != fiber.StatusOK || !strings.Contains(out, `"phrase":"karimla"`) {
		t.Fatalf("status = %d, body = %s, want detail with phrase", status, out)
	}
}
