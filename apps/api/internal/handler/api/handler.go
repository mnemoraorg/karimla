package api

import (
	"github.com/gofiber/fiber/v2"
	counterservice "github.com/mnemoraorg/karimla/apps/api/internal/domain/counter/service"
	authmiddleware "github.com/mnemoraorg/karimla/apps/api/internal/middleware/auth"
	"github.com/mnemoraorg/karimla/apps/api/internal/shared/response"
)

type CounterResponse struct {
	Count int `json:"count"`
}

type Handlers struct {
	Counter *counterservice.Service
}

func New(counterService *counterservice.Service) *Handlers {
	return &Handlers{Counter: counterService}
}

func (h *Handlers) GetCounter(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	count, err := h.Counter.GetCount(c.UserContext(), principal.AuthUserID)
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

func (h *Handlers) IncrementCounter(c *fiber.Ctx) error {
	principal := authmiddleware.Principal(c)
	count, err := h.Counter.Increment(c.UserContext(), principal.AuthUserID)
	if err != nil {
		return response.JSON(c, fiber.StatusInternalServerError, response.FailureWithError[any](
			"Could not count karimla", "counter_unavailable",
			"The count could not be saved", c, "counter.increment.failed", principal.AuthUserID, "error",
		))
	}
	return response.JSON(c, fiber.StatusOK, response.Success(
		CounterResponse{Count: count}, "Counted", c, "counter.increment.completed", principal.AuthUserID, "ok",
	))
}
