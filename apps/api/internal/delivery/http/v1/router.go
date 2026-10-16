package v1

import (
	"github.com/gofiber/fiber/v2"
	grouphandler "github.com/mnemoraorg/yappi/apps/api/internal/handler/v1/group"
	healthhandler "github.com/mnemoraorg/yappi/apps/api/internal/handler/v1/health"
	authmiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/auth"
	idempotencymiddleware "github.com/mnemoraorg/yappi/apps/api/internal/middleware/idempotency"
)

type Dependencies struct {
	Groups *grouphandler.Handlers
	Auth   authmiddleware.Validator
	// Idempotency replays repeated count taps. Nil passes taps through, so
	// tests that construct Dependencies without a store keep working.
	Idempotency idempotencymiddleware.Store
}

func Register(router fiber.Router, dependencies Dependencies) {
	v1 := router.Group("/v1")
	v1.Get("/health", healthhandler.Get)
	if dependencies.Auth == nil {
		return
	}

	if dependencies.Groups != nil {
		groups := v1.Group("/groups", authmiddleware.Require(dependencies.Auth))
		groups.Post("", dependencies.Groups.CreateGroup)
		groups.Get("", dependencies.Groups.ListGroups)
		groups.Post("/join", dependencies.Groups.JoinGroup)
		groups.Get("/:id", dependencies.Groups.GetGroup)
		groups.Post("/:id/invitations", dependencies.Groups.SendInvitations)
		groups.Post(
			"/:id/members/:userId/increment",
			idempotencymiddleware.Require(dependencies.Idempotency),
			dependencies.Groups.IncrementMember,
		)
		groups.Post(
			"/:id/members/:userId/decrement",
			idempotencymiddleware.Require(dependencies.Idempotency),
			dependencies.Groups.DecrementMember,
		)
	}
}
