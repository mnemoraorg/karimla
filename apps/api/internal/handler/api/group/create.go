package group

import (
	"github.com/gofiber/fiber/v2"
	domaingroup "github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared/response"
)

type CreateGroupInput struct {
	Name   string `json:"name"`
	Phrase string `json:"phrase"`
}

func (h *Handlers) CreateGroup(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	var input CreateGroupInput
	if err := c.BodyParser(&input); err != nil {
		return writeServiceError(c, principal.AuthUserID, domaingroup.ErrInvalidInput,
			"Could not create group", "The group could not be created", "group.create.failed")
	}

	created, err := h.Service.CreateGroup(
		c.UserContext(),
		principal.AuthUserID,
		displayNameOrEmail(principal.Name, principal.Email),
		input.Name,
		input.Phrase,
	)
	if err != nil {
		return writeServiceError(c, principal.AuthUserID, err,
			"Could not create group", "The group could not be created", "group.create.failed")
	}
	return response.JSON(c, fiber.StatusCreated, response.Success(
		mapGroup(created), "Group created", c, "group.create.completed", principal.AuthUserID, "ok",
	))
}
