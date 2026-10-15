package http

import (
	"github.com/gofiber/fiber/v2"
	httpv1 "github.com/mnemoraorg/yappi/apps/api/internal/delivery/http/v1"
)

func Register(app *fiber.App, dependencies ...httpv1.Dependencies) {
	var dependency httpv1.Dependencies
	if len(dependencies) > 0 {
		dependency = dependencies[0]
	}
	httpv1.Register(app.Group("/api"), dependency)
}
