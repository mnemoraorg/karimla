package group

import (
	"github.com/gofiber/fiber/v2"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared/response"
)

func (h *Handlers) IncrementMember(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	count, err := h.Service.IncrementMember(
		c.UserContext(), principal.AuthUserID, c.Params("id"), c.Params("userId"),
	)
	if err != nil {
		return writeServiceError(c, principal.AuthUserID, err,
			"Could not count", "The count could not be saved", "group.increment.failed")
	}
	return response.JSON(c, fiber.StatusOK, response.Success(
		CountResponse{Count: count}, "Counted", c,
		"group.increment.completed", principal.AuthUserID, "ok",
	))
}
