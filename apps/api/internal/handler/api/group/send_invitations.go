package group

import (
	"github.com/gofiber/fiber/v2"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared/response"
)

type SendInvitationsRequest struct {
	Emails []string `json:"emails"`
}

type SendInvitationsResponse struct {
	SentCount int `json:"sent_count"`
}

func (h *Handlers) SendInvitations(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	var request SendInvitationsRequest
	if err := c.BodyParser(&request); err != nil {
		return response.JSON(c, fiber.StatusBadRequest, response.FailureWithError[any](
			"Invalid request", "invalid_input", "Provide a valid list of email addresses",
			c, "group.invitation.send.failed", principal.AuthUserID, "warning",
		))
	}

	sentCount, err := h.Service.SendGroupInvitations(
		c.UserContext(), principal.AuthUserID, c.Params("id"), request.Emails,
	)
	if err != nil {
		return writeServiceError(c, principal.AuthUserID, err,
			"Could not send invitations", "The group invitations could not be sent", "group.invitation.send.failed")
	}
	return response.JSON(c, fiber.StatusOK, response.Success(
		SendInvitationsResponse{SentCount: sentCount}, "Invitations sent", c,
		"group.invitation.send.completed", principal.AuthUserID, "ok",
	))
}
