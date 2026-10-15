package group

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	groupservice "github.com/mnemoraorg/yappi/apps/api/internal/domain/group/service"
	domaingroup "github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared/response"
)

type GroupResponse struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Phrase     string `json:"phrase"`
	InviteCode string `json:"invite_code"`
}

type CountResponse struct {
	Count int `json:"count"`
}

type MemberResponse struct {
	UserID      string `json:"user_id"`
	DisplayName string `json:"display_name"`
	Count       int    `json:"count"`
	You         bool   `json:"you"`
}

type GroupDetailResponse struct {
	Group   GroupResponse   `json:"group"`
	Members []MemberResponse `json:"members"`
}

type Handlers struct {
	Service *groupservice.Service
}

func New(groupService *groupservice.Service) *Handlers {
	return &Handlers{Service: groupService}
}

func displayNameOrEmail(name, email string) string {
	if name != "" && name != email {
		return name
	}
	return email
}

func writeServiceError(
	c *fiber.Ctx,
	authUserID string,
	err error,
	message, detail, event string,
) error {
	switch {
	case errors.Is(err, domaingroup.ErrInvalidInput):
		return response.JSON(c, fiber.StatusBadRequest, response.FailureWithError[any](
			"Invalid request", "invalid_input",
			"Check the request and try again", c, event, authUserID, "warning",
		))
	case errors.Is(err, domaingroup.ErrNotMember):
		return response.JSON(c, fiber.StatusForbidden, response.FailureWithError[any](
			"Not a member", "not_member",
			"You are not a member of this group", c, event, authUserID, "warning",
		))
	case errors.Is(err, domaingroup.ErrNotFound):
		return response.JSON(c, fiber.StatusNotFound, response.FailureWithError[any](
			"Not found", "not_found",
			"The requested group or member was not found", c, event, authUserID, "warning",
		))
	default:
		return response.JSON(c, fiber.StatusInternalServerError, response.FailureWithError[any](
			message, "group_unavailable", detail, c, event, authUserID, "error",
		))
	}
}

func mapGroup(group domaingroup.Group) GroupResponse {
	return GroupResponse{ID: group.ID, Name: group.Name, Phrase: group.Phrase, InviteCode: group.InviteCode}
}

func mapDetail(detail domaingroup.GroupDetail) GroupDetailResponse {
	members := make([]MemberResponse, 0, len(detail.Members))
	for _, entry := range detail.Members {
		members = append(members, MemberResponse{
			UserID:      entry.AuthUserID,
			DisplayName: entry.DisplayName,
			Count:       entry.Count,
			You:         entry.You,
		})
	}
	return GroupDetailResponse{Group: mapGroup(detail.Group), Members: members}
}
