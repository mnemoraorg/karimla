package counter

import "strings"

// ValidateUserID reports whether authUserID is usable as a counter owner.
// The service calls it before touching the repository so every orchestration
// entry point enforces the rule, not just the HTTP middleware.
func ValidateUserID(authUserID string) error {
	if strings.TrimSpace(authUserID) == "" {
		return ErrInvalidInput
	}
	return nil
}
