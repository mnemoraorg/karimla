package email

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"html/template"
	"log/slog"
	"slices"
	"time"

	"github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/email_sending"
	"github.com/cloudflare/cloudflare-go/v6/option"
	"github.com/cloudflare/cloudflare-go/v6/shared"
	"github.com/mnemoraorg/yappi/apps/api/internal/config"
	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
	emailtemplates "github.com/mnemoraorg/yappi/apps/api/templates"
)

const invitationSendTimeout = 10 * time.Second

var invitationTemplate = template.Must(template.ParseFS(emailtemplates.Files, "group-invitation.html"))

type EmailSendingClient interface {
	Send(
		ctx context.Context,
		params email_sending.EmailSendingSendParams,
		opts ...option.RequestOption,
	) (*email_sending.EmailSendingSendResponse, error)
}

type CloudflareInvitationSender struct {
	client EmailSendingClient
	config config.EmailDeliveryConfig
}

func NewCloudflareInvitationSender(
	cfg config.EmailDeliveryConfig,
	client EmailSendingClient,
) *CloudflareInvitationSender {
	return &CloudflareInvitationSender{client: client, config: cfg}
}

func (s *CloudflareInvitationSender) SendGroupInvitations(
	ctx context.Context,
	recipients []string,
	invitedGroup group.Group,
) error {
	var htmlBody bytes.Buffer
	if err := invitationTemplate.Execute(&htmlBody, invitedGroup); err != nil {
		slog.ErrorContext(ctx, "render group invitation email failed", "error_type", fmt.Sprintf("%T", err))
		return errors.New("render group invitation email failed")
	}

	textBody := fmt.Sprintf(
		"You're invited to join %s on Yappi and count every %q.\n\nOpen https://yappi.mnemora.org, choose Join a group, and enter this invite code: %s\n\nIf you weren't expecting this invitation, you can safely ignore this email.",
		invitedGroup.Name, invitedGroup.Phrase, invitedGroup.InviteCode,
	)
	ctx, cancel := context.WithTimeout(ctx, invitationSendTimeout)
	defer cancel()

	// shortcut: a later provider failure can follow earlier deliveries; add delivery tracking before retry-safe bulk sends.
	for _, recipient := range recipients {
		response, err := s.client.Send(ctx, email_sending.EmailSendingSendParams{
			AccountID: cloudflare.F(s.config.CloudflareAccountID),
			From: cloudflare.F[email_sending.EmailSendingSendParamsFromUnion](
				shared.UnionString(s.config.InvitationEmail),
			),
			To: cloudflare.F[email_sending.EmailSendingSendParamsToUnion](
				shared.UnionString(recipient),
			),
			Subject: cloudflare.F("You're invited to a Yappi group"),
			HTML:    cloudflare.F(htmlBody.String()),
			Text:    cloudflare.F(textBody),
		})
		if err != nil {
			slog.ErrorContext(ctx, "send group invitation email failed", "error_type", fmt.Sprintf("%T", err))
			return errors.New("send group invitation email failed")
		}
		if response == nil || (!slices.Contains(response.Delivered, recipient) && !slices.Contains(response.Queued, recipient)) {
			slog.ErrorContext(ctx, "group invitation email was not accepted by Cloudflare")
			return errors.New("group invitation email was not accepted")
		}
	}
	return nil
}
