package group

import (
	"github.com/gofiber/fiber/v2"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared/response"
)

func (h *Handlers) GetGroup(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	detail, err := h.Service.GetGroupDetail(c.UserContext(), principal.AuthUserID, c.Params("id"))
	if err != nil {
		return writeServiceError(c, principal.AuthUserID, err,
			"Could not load group", "The group could not be loaded", "group.get.failed")
	}
	return response.JSON(c, fiber.StatusOK, response.Success(
		mapDetail(detail), "Group loaded", c, "group.get.completed", principal.AuthUserID, "ok",
	))
}
