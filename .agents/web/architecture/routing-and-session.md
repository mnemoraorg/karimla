# Routing and session

## Route groups

- `app/(auth)/login` is the public sign-in page. It is an async Server Component: when `getYappiSession()` finds a session it calls `redirect("/")`, so logged-in users never see the form.
- `app/(protected)/page.tsx` is the counter page. It calls `requireYappiSession()` before rendering, so logged-out visitors are redirected to `/login`.
- The root `app/layout.tsx` provides theme, toast, tooltip, and React Query providers. It owns no auth decisions.

## Session source

`lib/auth/session.ts` is server-only. It forwards request cookies to BetterAuth `GET /api/v1/auth/get-session` (`cache: "no-store"`, 8s timeout) and maps the payload through the pure `toYappiSession()` in `lib/auth/session-user.ts`:

- `getYappiSession()` returns the session or `null` on any failure (logged-out and outage both redirect to `/login`).
- `requireYappiSession()` redirects to `/login` when there is no session.
- Never parse the session cookie in web code; BetterAuth owns its format.

## Login flow

1. Email step posts through `useSendLoginOtp` → `POST /email-otp/send-verification-otp`.
2. On success the pending email is stored in session storage, the URL becomes `/login?step=verify`, and the code step renders.
3. Code step posts through `useSignInWithOtp` → `POST /sign-in/email-otp`; on success the pending email is cleared and the browser replaces to `/`, picking up the session cookie.
4. Reloading or navigating back on `?step=verify` restores the code step from session storage; a verify URL with no stored email stays on the email step.

- "Resend code" reuses the stored email and is gated by a 60s cooldown persisted in local storage (restored after refresh) and enforced server-side by the plugin rate limit; "use a different email" clears storage and the query param.
