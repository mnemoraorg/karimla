package group

import (
	"github.com/gofiber/fiber/v2"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
	domaingroup "github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared/response"
)

type JoinGroupInput struct {
	Code string `json:"code"`
}

func (h *Handlers) JoinGroup(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	var input JoinGroupInput
	if err := c.BodyParser(&input); err != nil {
		return writeServiceError(c, principal.AuthUserID, domaingroup.ErrInvalidInput,
			"Could not join group", "The group could not be joined", "group.join.failed")
	}

	joined, err := h.Service.JoinGroup(
		c.UserContext(),
		principal.AuthUserID,
		displayNameOrEmail(principal.Name, principal.Email),
		input.Code,
	)
	if err != nil {
		return writeServiceError(c, principal.AuthUserID, err,
			"Could not join group", "The group could not be joined", "group.join.failed")
	}
	return response.JSON(c, fiber.StatusOK, response.Success(
		mapGroup(joined), "Group joined", c, "group.join.completed", principal.AuthUserID, "ok",
	))
}
