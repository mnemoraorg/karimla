# Karimla auth instructions

## Required context

Before changing identity ownership, authentication persistence, session handling, or auth architecture, read `.agents/auth/AGENTS.md` and the relevant reference under `.agents/auth/architecture/`.

## Scope

`apps/auth/` is the BetterAuth identity service. It owns users, sessions, and email OTP sign-in. The Go API trusts its opaque user IDs and must not duplicate identity data.

## Architecture

Follow the Mnemora auth boundaries without copying unrelated invitation, Redis, or platform features:

- `config/` validates intent-specific environment settings; `lib/load-config.ts` shares schema loading.
- `src/auth.ts` composes BetterAuth, Kysely/PostgreSQL, and email delivery.
- `src/http.ts` composes Hono routes and CORS.
- `src/server.ts` owns Bun lifecycle.
- `src/mailing/` delivers email; `templates/` contains static templates.
- `db/` owns BetterAuth's `auth` schema migration.

Use BetterAuth's `emailOTP` plugin (6-digit code, 10-minute expiry, hashed storage). Do not add passwords or magic links. Keep BetterAuth responses unwrapped.

## Commands

Run commands from the repository root:

```sh
bun install
bun run --cwd apps/auth dev
bun run --cwd apps/auth test
bun run --cwd apps/auth check-types
bun run --cwd apps/auth db:generate
bun run --cwd apps/auth db:migrate
```

The service uses port `35081`, recorded in `.docs/ports.md`. `.env.example` documents configuration. Keep `.env`, secrets, generated outputs, and database state out of commits.

## Email

Verification codes are delivered through Cloudflare Email using `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and `NO_REPLY_EMAIL`. `INVITATION_EMAIL` is reserved for invitations and is not used by this app. Never log OTP codes or credentials.

## Testing

- `test/unit/` contains configuration and pure logic tests without PostgreSQL.
- `test/integration/` covers Hono HTTP routes and CORS without starting PostgreSQL.
- Keep PostgreSQL and real email tests at explicit integration boundaries; do not require developer-local credentials in unit tests.
