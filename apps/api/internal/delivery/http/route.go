package http

import (
	"github.com/gofiber/fiber/v2"
	httpv1 "github.com/mnemoraorg/karimla/apps/api/internal/delivery/http/v1"
)

func Register(app *fiber.App) {
	httpv1.Register(app.Group("/api"))
}
