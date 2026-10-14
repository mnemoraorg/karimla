package counter

import (
	"github.com/gofiber/fiber/v2"
	authmiddleware "github.com/mnemoraorg/karimla/apps/api/internal/middleware/auth"
	"github.com/mnemoraorg/karimla/apps/api/internal/shared/response"
)

func (h *Handlers) GetCounter(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	count, err := h.Service.GetCount(c.UserContext(), principal.AuthUserID)
	if err != nil {
		return response.JSON(c, fiber.StatusInternalServerError, response.FailureWithError[any](
			"Could not load count", "counter_unavailable",
			"The count could not be loaded", c, "counter.get.failed", principal.AuthUserID, "error",
		))
	}
	return response.JSON(c, fiber.StatusOK, response.Success(
		CounterResponse{Count: count}, "Count loaded", c, "counter.get.completed", principal.AuthUserID, "ok",
	))
}
