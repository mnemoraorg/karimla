package counter

import "strings"

func ValidateUserID(authUserID string) error {
	if strings.TrimSpace(authUserID) == "" {
		return ErrInvalidInput
	}
	return nil
}
