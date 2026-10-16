package group

import (
	"crypto/rand"
	"strings"
)

const inviteAlphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

const inviteCodeLength = 8

func GenerateInviteCode() string {
	letters := []byte(inviteAlphabet)
	code := make([]byte, inviteCodeLength)
	random := make([]byte, inviteCodeLength)
	if _, err := rand.Read(random); err != nil {
		panic("crypto/rand unavailable: " + err.Error())
	}
	for i := range code {
		code[i] = letters[int(random[i])%len(letters)]
	}
	return string(code)
}

func ValidateNewGroup(name, phrase string) error {
	if strings.TrimSpace(name) == "" || len(name) > 60 {
		return ErrInvalidInput
	}
	if strings.TrimSpace(phrase) == "" || len(phrase) > 60 {
		return ErrInvalidInput
	}
	return nil
}

func ValidateInviteCode(code string) error {
	if len(code) != inviteCodeLength {
		return ErrInvalidInput
	}
	for _, character := range code {
		if !strings.ContainsRune(inviteAlphabet, character) {
			return ErrInvalidInput
		}
	}
	return nil
}

func ValidateUserID(authUserID string) error {
	if strings.TrimSpace(authUserID) == "" {
		return ErrInvalidInput
	}
	return nil
}
