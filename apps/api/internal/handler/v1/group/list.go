package group

import (
	"github.com/gofiber/fiber/v2"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared/response"
)

func (h *Handlers) ListGroups(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	found, err := h.Service.ListGroups(c.UserContext(), principal.AuthUserID)
	if err != nil {
		return writeServiceError(c, principal.AuthUserID, err,
			"Could not load groups", "The groups could not be loaded", "group.list.failed")
	}

	groups := make([]GroupListResponse, 0, len(found))
	for _, entry := range found {
		groups = append(groups, mapGroupSummary(entry))
	}
	return response.JSON(c, fiber.StatusOK, response.Success(
		groups, "Groups loaded", c, "group.list.completed", principal.AuthUserID, "ok",
	))
}
