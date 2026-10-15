package service

import (
	"context"
	"net/mail"
	"strings"

	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
)

func (s *Service) SendGroupInvitations(
	ctx context.Context,
	callerID, groupID string,
	emails []string,
) (int, error) {
	if err := group.ValidateUserID(callerID); err != nil {
		return 0, err
	}
	if groupID == "" {
		return 0, group.ErrInvalidInput
	}

	recipients, err := normalizeInvitationEmails(emails)
	if err != nil {
		return 0, err
	}

	found, err := s.groups.GetGroup(ctx, groupID)
	if err != nil {
		return 0, err
	}
	member, err := s.groups.IsMember(ctx, groupID, callerID)
	if err != nil {
		return 0, err
	}
	if !member {
		return 0, group.ErrNotMember
	}
	if s.invitationSender == nil {
		return 0, group.ErrInvitationsUnavailable
	}
	if err := s.invitationSender.SendGroupInvitations(ctx, recipients, found); err != nil {
		return 0, group.ErrInvitationsUnavailable
	}
	return len(recipients), nil
}

func normalizeInvitationEmails(emails []string) ([]string, error) {
	if len(emails) == 0 || len(emails) > group.MaxInvitationRecipients {
		return nil, group.ErrInvalidInput
	}

	recipients := make([]string, 0, len(emails))
	seen := make(map[string]struct{}, len(emails))
	for _, email := range emails {
		email = strings.TrimSpace(email)
		parsed, err := mail.ParseAddress(email)
		if err != nil || len(email) > 254 || parsed.Address != email {
			return nil, group.ErrInvalidInput
		}
		key := strings.ToLower(email)
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		recipients = append(recipients, email)
	}
	return recipients, nil
}
