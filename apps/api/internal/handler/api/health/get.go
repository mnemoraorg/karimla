package health

import "github.com/gofiber/fiber/v2"

func Get(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "UP", "groups": []string{"liveness", "readiness"}})
}
