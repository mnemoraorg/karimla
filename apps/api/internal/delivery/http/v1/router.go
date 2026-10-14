package v1

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mnemoraorg/karimla/apps/api/internal/handler/api"
	healthhandler "github.com/mnemoraorg/karimla/apps/api/internal/handler/health"
	authmiddleware "github.com/mnemoraorg/karimla/apps/api/internal/middleware/auth"
)

type Dependencies struct {
	Handlers *api.Handlers
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
}
