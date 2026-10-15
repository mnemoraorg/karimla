package v1

import (
	"github.com/gofiber/fiber/v2"
	counterhandler "github.com/mnemoraorg/yappi/apps/api/internal/handler/api/counter"
	grouphandler "github.com/mnemoraorg/yappi/apps/api/internal/handler/api/group"
	healthhandler "github.com/mnemoraorg/yappi/apps/api/internal/handler/api/health"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
)

type Dependencies struct {
	Counter *counterhandler.Handlers
	Groups  *grouphandler.Handlers
	Auth    authmiddleware.Validator
}

func Register(router fiber.Router, dependencies Dependencies) {
	v1 := router.Group("/v1")
	v1.Get("/health", healthhandler.Get)
	if dependencies.Auth == nil {
		return
	}

	if dependencies.Counter != nil {
		counter := v1.Group("/counter", authmiddleware.Require(dependencies.Auth))
		counter.Get("", dependencies.Counter.GetCounter)
		counter.Post("/increment", dependencies.Counter.IncrementCounter)
		counter.Post("/decrement", dependencies.Counter.DecrementCounter)
	}
	if dependencies.Groups != nil {
		groups := v1.Group("/groups", authmiddleware.Require(dependencies.Auth))
		groups.Post("", dependencies.Groups.CreateGroup)
		groups.Get("", dependencies.Groups.ListGroups)
		groups.Post("/join", dependencies.Groups.JoinGroup)
		groups.Get("/:id", dependencies.Groups.GetGroup)
		groups.Post("/:id/members/:userId/increment", dependencies.Groups.IncrementMember)
		groups.Post("/:id/members/:userId/decrement", dependencies.Groups.DecrementMember)
	}
}
