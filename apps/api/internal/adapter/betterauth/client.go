package betterauth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/mnemoraorg/yappi/apps/api/internal/shared"
)

var ErrUnavailable = errors.New("authentication service unavailable")

const sessionPath = "/api/v1/auth/get-session"

type SessionClient struct {
	baseURL string
	http    *http.Client
}

func NewSessionClient(baseURL string) *SessionClient {
	return &SessionClient{
		baseURL: strings.TrimRight(baseURL, "/"),
		http: &http.Client{Transport: &http.Transport{
			DialContext: (&net.Dialer{Timeout: time.Second, KeepAlive: 30 * time.Second}).DialContext,
		}},
	}
}

func (c *SessionClient) Validate(ctx context.Context, cookie, authorization string) (shared.Principal, bool, error) {
	if strings.TrimSpace(cookie) == "" && strings.TrimSpace(authorization) == "" {
		return shared.Principal{}, false, nil
	}
	if c.baseURL == "" {
		return shared.Principal{}, false, ErrUnavailable
	}

	requestContext, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	request, err := http.NewRequestWithContext(requestContext, http.MethodGet, c.baseURL+sessionPath, nil)
	if err != nil {
		return shared.Principal{}, false, ErrUnavailable
	}
	if cookie != "" {
		request.Header.Set("Cookie", cookie)
	}
	if authorization != "" {
		request.Header.Set("Authorization", authorization)
	}
	response, err := c.http.Do(request)
	if err != nil {
		return shared.Principal{}, false, fmt.Errorf("%w: %v", ErrUnavailable, err)
	}
	defer response.Body.Close()
	if response.StatusCode == http.StatusUnauthorized || response.StatusCode == http.StatusForbidden {
		return shared.Principal{}, false, nil
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return shared.Principal{}, false, fmt.Errorf("%w: status %d", ErrUnavailable, response.StatusCode)
	}

	var payload struct {
		User *struct {
			ID            string `json:"id"`
			Email         string `json:"email"`
			Name          string `json:"name"`
			EmailVerified bool   `json:"emailVerified"`
		} `json:"user"`
	}
	if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
		return shared.Principal{}, false, fmt.Errorf("%w: decode session: %v", ErrUnavailable, err)
	}
	if payload.User == nil || strings.TrimSpace(payload.User.ID) == "" {
		return shared.Principal{}, false, nil
	}
	return shared.Principal{
		AuthUserID:    payload.User.ID,
		Email:         payload.User.Email,
		Name:          payload.User.Name,
		EmailVerified: payload.User.EmailVerified,
	}, true, nil
}
