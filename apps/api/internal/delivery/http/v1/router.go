package v1

import (
	"github.com/gofiber/fiber/v2"
	counterhandler "github.com/mnemoraorg/yappi/apps/api/internal/handler/api/counter"
	healthhandler "github.com/mnemoraorg/yappi/apps/api/internal/handler/api/health"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
)

type Dependencies struct {
	Handlers *counterhandler.Handlers
	Auth     authmiddleware.Validator
}

func Register(router fiber.Router, dependencies Dependencies) {
	v1 := router.Group("/v1")
	v1.Get("/health", healthhandler.Get)
	if dependencies.Handlers == nil || dependencies.Auth == nil {
		return
	}

	counter := v1.Group("/counter", authmiddleware.Require(dependencies.Auth))
	counter.Get("", dependencies.Handlers.GetCounter)
	counter.Post("/increment", dependencies.Handlers.IncrementCounter)
	counter.Post("/decrement", dependencies.Handlers.DecrementCounter)
}
