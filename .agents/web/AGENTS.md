# Web architecture guidance

This document is the active architecture guidance for `apps/web/`. The scoped runtime instructions are in `apps/web/AGENTS.md`; the full reference index is [architecture/_index.md](architecture/_index.md); ports are recorded in `.docs/ports.md`.

## Ownership

`apps/web/` owns routes, presentation, and client session UX. It does not own identity or business data:

- BetterAuth owns identity and session semantics. The web app only reads the session through `get-session` and redirects; it never verifies codes or mints sessions itself.
- The Go API (port `35080`) owns groups, memberships, and counts; it will own friends data next. Do not build browser-storage persistence for data the API owns.
- No passwords, OTP codes, or session tokens are stored, logged, or decided by web code.

## Boundary and request flow

```text
Browser
    ↓
Web routes (RSC) + client components
    ↓               ↓
BetterAuth      Planned Go API
/api/v1/auth    (counter, friends)
```

Server components forward request cookies to BetterAuth; client requests use `credentials: "include"`. Auth responses drive redirects, never stored credentials.

## Session and routes

- `app/(protected)/` requires a session (`requireYappiSession`) and redirects to `/login` without one.
- `app/(auth)/login` redirects to `/` when a session already exists.
- The login form is email → 6-digit code; the pending email survives refresh through `?step=verify` plus session storage and is cleared on verify or email change.
- Sign-in rate limits belong to the service. A `429` reports the remaining window in `X-Retry-After`, which the auth CORS boundary exposes; the form counts that window down on whichever action it blocks (send, resend, or verify) and keeps the resend deadline in local storage, because the limit applies per IP and path rather than per browser.
- Treat any auth outage as logged-out (redirect to `/login`); there is no separate error page.

## Data fetching

- HTTP request functions live in `api/`; React Query wrappers live in `hooks/api/`; components call hooks and never call endpoints or `fetch` directly.
- The shared `QueryClient` disables retries and refetch-on-focus; mutations surface typed errors the form renders.
- Public configuration comes from the required `NEXT_PUBLIC_*` variables validated in `apps/web/lib/env.ts`; auth and API URLs include `/api/v1`.

## Testing

Tests follow the tiered layout under `apps/web/test/`, mirroring `apps/auth/test/`:

- `test/unit/` contains API-function and pure-helper tests run with `bun test`.
- `test/integration/` and `test/e2e/` are reserved for HTTP-boundary and full-flow coverage; do not create them until a real behavior needs them.
- Keep `next/*` imports out of unit-tested modules; put Next-dependent code behind pure modules like `lib/auth/session-user.ts`.

## Reference routing

- Read the relevant reference under `.agents/web/architecture/` for routing, fetching, structure, or testing changes.
- Update `apps/web/.env.example` and `.docs/ports.md` when the web configuration contract or ports change.

Keep this document focused on ownership and boundaries; do not turn it into a runbook.
