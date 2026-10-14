package v1

import (
	"github.com/gofiber/fiber/v2"
	healthhandler "github.com/mnemoraorg/karimla/apps/api/internal/handler/health"
)

func Register(router fiber.Router) {
	v1 := router.Group("/v1")
	v1.Get("/health", healthhandler.Get)
}
