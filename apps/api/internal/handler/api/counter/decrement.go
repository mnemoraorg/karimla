package counter

import (
	"github.com/gofiber/fiber/v2"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared/response"
)

func (h *Handlers) DecrementCounter(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	count, err := h.Service.Decrement(c.UserContext(), principal.AuthUserID)
	if err != nil {
		return writeServiceError(c, principal.AuthUserID, err,
			"Could not decrease count", "The count could not be saved", "counter.decrement.failed")
	}
	return response.JSON(c, fiber.StatusOK, response.Success(
		CounterResponse{Count: count}, "Counted down", c, "counter.decrement.completed", principal.AuthUserID, "ok",
	))
}
