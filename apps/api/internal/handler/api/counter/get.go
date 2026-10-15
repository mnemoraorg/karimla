package counter

import (
	"github.com/gofiber/fiber/v2"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared/response"
)

func (h *Handlers) GetCounter(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	count, err := h.Service.GetCount(c.UserContext(), principal.AuthUserID)
	if err != nil {
		return writeServiceError(c, principal.AuthUserID, err,
			"Could not load count", "The count could not be loaded", "counter.get.failed")
	}
	return response.JSON(c, fiber.StatusOK, response.Success(
		CounterResponse{Count: count}, "Count loaded", c, "counter.get.completed", principal.AuthUserID, "ok",
	))
}
