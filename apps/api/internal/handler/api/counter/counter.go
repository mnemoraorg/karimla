package counter

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/mnemoraorg/karimla/apps/api/internal/domain/counter"
	counterservice "github.com/mnemoraorg/karimla/apps/api/internal/domain/counter/service"
	"github.com/mnemoraorg/karimla/apps/api/internal/shared/response"
)

type CounterResponse struct {
	Count int `json:"count"`
}

type Handlers struct {
	Service *counterservice.Service
}

func New(counterService *counterservice.Service) *Handlers {
	return &Handlers{Service: counterService}
}

func writeServiceError(
	c *fiber.Ctx,
	authUserID string,
	err error,
	message, detail, event string,
) error {
	if errors.Is(err, counter.ErrInvalidInput) {
		return response.JSON(c, fiber.StatusBadRequest, response.FailureWithError[any](
			"Invalid request", "invalid_input",
			"Check the request and try again", c, event, authUserID, "warning",
		))
	}
	return response.JSON(c, fiber.StatusInternalServerError, response.FailureWithError[any](
		message, "counter_unavailable", detail, c, event, authUserID, "error",
	))
}
