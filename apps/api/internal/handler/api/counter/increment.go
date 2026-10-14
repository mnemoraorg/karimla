package counter

import (
	"github.com/gofiber/fiber/v2"
	authmiddleware "github.com/mnemoraorg/karimla/apps/api/internal/middleware/auth"
	"github.com/mnemoraorg/karimla/apps/api/internal/shared/response"
)

func (h *Handlers) IncrementCounter(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	count, err := h.Service.Increment(c.UserContext(), principal.AuthUserID)
	if err != nil {
		return writeServiceError(c, principal.AuthUserID, err,
			"Could not count karimla", "The count could not be saved", "counter.increment.failed")
	}
	return response.JSON(c, fiber.StatusOK, response.Success(
		CounterResponse{Count: count}, "Counted", c, "counter.increment.completed", principal.AuthUserID, "ok",
	))
}
