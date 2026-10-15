package auth

import (
	"context"
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/mnemoraorg/yappi/apps/api/internal/adapter/betterauth"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared"
	"github.com/mnemoraorg/yappi/apps/api/internal/shared/response"
)

const principalKey = "yappi.principal"

type Validator interface {
	Validate(context.Context, string, string) (shared.Principal, bool, error)
}

func Require(validator Validator) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if c.Method() == fiber.MethodOptions {
			return c.Next()
		}
		if validator == nil {
			return unavailable(c)
		}
		principal, valid, err := validator.Validate(c.UserContext(), c.Get("Cookie"), c.Get("Authorization"))
		if err != nil {
			if errors.Is(err, betterauth.ErrUnavailable) {
				return unavailable(c)
			}
			return unavailable(c)
		}
		if !valid {
			return response.JSON(c, fiber.StatusUnauthorized, response.FailureWithError[any]("Unauthorized", "unauthorized", "Authentication is required", c, "auth.unauthorized", "", "warning"))
		}
		c.Locals(principalKey, principal)
		return c.Next()
	}
}

func Principal(c *fiber.Ctx) shared.Principal {
	principal, _ := c.Locals(principalKey).(shared.Principal)
	return principal
}

func unavailable(c *fiber.Ctx) error {
	return response.JSON(c, fiber.StatusServiceUnavailable, response.Failure[any]("Authentication service temporarily unavailable", "auth_unavailable", c, "auth.service.unavailable", "", "error"))
}
