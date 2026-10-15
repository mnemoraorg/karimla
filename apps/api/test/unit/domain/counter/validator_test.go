package counter_test

import (
	"errors"
	"testing"

	"github.com/mnemoraorg/yappi/apps/api/internal/domain/counter"
)

func TestValidateUserIDRejectsBlankOwners(t *testing.T) {
	for _, authUserID := range []string{"", "   "} {
		if err := counter.ValidateUserID(authUserID); !errors.Is(err, counter.ErrInvalidInput) {
			t.Fatalf("ValidateUserID(%q) = %v, want ErrInvalidInput", authUserID, err)
		}
	}
	if err := counter.ValidateUserID("user-1"); err != nil {
		t.Fatalf("ValidateUserID(user-1) = %v, want nil", err)
	}
}
