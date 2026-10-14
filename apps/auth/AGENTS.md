# Karimla auth instructions

## Scope

`apps/auth/` is the BetterAuth identity service. It owns users, sessions, and the email one-time-code sign-in. The Go API on port `35080` trusts this service for identity; it does not hold identity data itself.

## Stack and commands

Bun 1.3.14, TypeScript, BetterAuth, Kysely, `pg`, Hono, PostgreSQL, Vitest.

Run commands from the repository root:

```sh
bun install
bun run --cwd apps/auth dev
bun run --cwd apps/auth test
bun run --cwd apps/auth check-types
```

The port is `35081`, recorded in `.docs/ports.md`. `.env.example` is the configuration contract. Keep the real `.env` out of commits; it is ignored.

## Sign-in

A single email both signs up and signs in through the BetterAuth `emailOTP` plugin. With no mail provider configured, the code is written to the server console.

## Migrations

BetterAuth owns the identity tables. Generate the SQL against a reachable PostgreSQL, then apply it before starting the service:

```sh
bun x @better-auth/cli@latest generate --config apps/auth/config/better-auth.ts --output apps/auth/db/auth-schema.sql
```

Never run migrations against a shared database without checking `.docs/` first.
