package email_test

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"testing"

	"github.com/cloudflare/cloudflare-go/v6/email_sending"
	"github.com/cloudflare/cloudflare-go/v6/option"
	cloudflareemail "github.com/mnemoraorg/yappi/apps/api/internal/adapter/email"
	"github.com/mnemoraorg/yappi/apps/api/internal/config"
	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
)

type sentEmail struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Subject string `json:"subject"`
	HTML    string `json:"html"`
	Text    string `json:"text"`
}

type fakeEmailSendingClient struct {
	sent []sentEmail
	err  error
}

func (f *fakeEmailSendingClient) Send(
	_ context.Context,
	params email_sending.EmailSendingSendParams,
	_ ...option.RequestOption,
) (*email_sending.EmailSendingSendResponse, error) {
	payload, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}
	var message sentEmail
	if err := json.Unmarshal(payload, &message); err != nil {
		return nil, err
	}
	f.sent = append(f.sent, message)
	if f.err != nil {
		return nil, f.err
	}
	return &email_sending.EmailSendingSendResponse{Delivered: []string{message.To}}, nil
}

func TestCloudflareInvitationSenderSendsPrivateEscapedMessages(t *testing.T) {
	client := &fakeEmailSendingClient{}
	sender := cloudflareemail.NewCloudflareInvitationSender(config.EmailDeliveryConfig{
		CloudflareAPIToken:  "token",
		CloudflareAccountID: "account",
		InvitationEmail:     "invitation@example.com",
	}, client)
	invitedGroup := group.Group{
		Name:       "A & <b>Team</b>",
		Phrase:     "<script>alert(1)</script>",
		InviteCode: "CODE1234",
	}

	if err := sender.SendGroupInvitations(context.Background(), []string{
		"first@example.com", "second@example.com",
	}, invitedGroup); err != nil {
		t.Fatal(err)
	}
	if len(client.sent) != 2 || client.sent[0].To != "first@example.com" || client.sent[1].To != "second@example.com" {
		t.Fatalf("sent = %+v, want one private message per recipient", client.sent)
	}
	for _, message := range client.sent {
		if message.From != "invitation@example.com" || message.Subject != "You're invited to a Yappi group" {
			t.Fatalf("message headers = %+v, want configured sender and subject", message)
		}
		if !strings.Contains(message.HTML, "A &amp; &lt;b&gt;Team&lt;/b&gt;") ||
			!strings.Contains(message.HTML, "&lt;script&gt;alert(1)&lt;/script&gt;") ||
			!strings.Contains(message.HTML, "CODE1234") {
			t.Fatalf("HTML = %s, want escaped group values and invite code", message.HTML)
		}
		if !strings.Contains(message.Text, "A & <b>Team</b>") || !strings.Contains(message.Text, "CODE1234") {
			t.Fatalf("text = %s, want group name and invite code", message.Text)
		}
	}
}

func TestCloudflareInvitationSenderReturnsProviderFailure(t *testing.T) {
	client := &fakeEmailSendingClient{err: errors.New("provider unavailable")}
	sender := cloudflareemail.NewCloudflareInvitationSender(config.EmailDeliveryConfig{}, client)

	if err := sender.SendGroupInvitations(context.Background(), []string{"person@example.com"}, group.Group{}); err == nil {
		t.Fatal("expected provider error")
	}
}
