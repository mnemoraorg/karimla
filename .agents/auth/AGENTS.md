# Yappi auth architecture guidance

This document is the active architecture guidance for `apps/auth/`. The scoped runtime instructions are in `apps/auth/AGENTS.md`; the full reference index is [architecture/_index.md](architecture/_index.md); feature rules belong under `guides/`; ports are recorded in `.docs/ports.md`.

## Identity ownership

BetterAuth is Yappi's canonical identity owner. It owns:

- users
- accounts
- sessions
- verification records
- opaque identity IDs

Sign-in is email-only via the BetterAuth `emailOTP` plugin (6-digit code, 10-minute expiry, hashed storage). There are no passwords and no magic links. A new email signs up on first code verification; an existing email signs in.

The Go API (planned, port `35080`) owns counter and friends data only. It consumes an opaque BetterAuth user ID and must not create a duplicate API `users` table or copy credentials.

Custom roles, organizations, account linking, invitations, or other identity features require an explicit product decision. Do not introduce them as scaffolding. `INVITATION_EMAIL` is reserved and unused by this app.

## Boundary and request flow

```text
HTTP client
    ↓
Bun HTTP server
    ↓
Hono HTTP/CORS boundary
    ↓
BetterAuth email-OTP handler
    ↓
Kysely/pg
    ↓
PostgreSQL auth schema
```

The Bun server owns transport concerns only: health, route delegation, process lifecycle, and safe configuration loading. BetterAuth owns authentication behavior and session semantics. PostgreSQL stores BetterAuth's identity and session records in the `auth` schema. Cloudflare Email delivers the verification code; it owns nothing about identity.

## Configuration and secrets

- Read configuration through the intent-specific modules under `apps/auth/config/`.
- Use `apps/auth/lib/load-config.ts` for shared typed schema loading; keep schemas and mapping in their intent-specific modules.
- Keep local values in `apps/auth/.env`; keep safe placeholders in `apps/auth/.env.example`.
- Require a strong `BETTER_AUTH_SECRET` outside tests.
- Set `BETTER_AUTH_COOKIE_DOMAIN` to the parent domain shared with the web app in production (for example `mnemora.org` for `auth-yappi.mnemora.org` and `yappi.mnemora.org`). Without it BetterAuth issues a host-only session cookie, the web app cannot read the session, and every protected route redirects to `/login`. Configuration fails fast in production when it is missing.
- Keep trusted origins explicit and limited to known application origins.
- Never log or expose database URLs, secrets, OTP codes, cookies, credentials, or session tokens.

## Persistence and migrations

BetterAuth's PostgreSQL adapter owns the `auth` schema. `apps/auth/db/migrate.ts` generates (`db:generate`) and applies (`db:migrate`) that schema. Run the migration command before starting an environment with a new database:

```sh
bun run --cwd apps/auth db:migrate
```

The server fails fast at startup when PostgreSQL is unreachable or the auth tables are missing. Do not manage BetterAuth tables with API migrations. Do not hand-edit generated BetterAuth schema output or introduce a second migration owner.

## Email

Verification codes are sent through `src/mailing/cloudflare-email-sender.ts` using the static template in `templates/verification-otp.html`. The sender address comes from `NO_REPLY_EMAIL`. Never log the code.

## Testing

Tests follow the tiered layout under `apps/auth/test/`:

- `test/unit/` contains pure configuration and sender tests and does not require PostgreSQL.
- `test/integration/` contains HTTP boundary, health, and CORS tests.
- `test/e2e/` contains email-OTP sign-up/sign-in behavior tests using BetterAuth's in-memory adapter.
- PostgreSQL persistence and real email delivery belong at an explicit integration boundary and must not require developer-local credentials.
- Tests must verify opaque string IDs without asserting a particular ID format.

## Reference routing

- Read the relevant reference under `.agents/auth/architecture/` for architecture or boundary changes.
- Add a guide under `.agents/auth/guides/` only when auth product behavior is stable enough to guide future changes.
- Update `.docs/ports.md` and `apps/auth/.env.example` when ports or configuration change.

Keep this document focused on ownership and boundaries; do not turn it into a runbook.
