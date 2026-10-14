# Runtime

## Configuration

Environment variables are parsed by intent-specific schemas under `apps/auth/config/`:

- `app.ts` — `PORT` (default `35081`), `ENVIRONMENT` (default `development`).
- `db.ts` — `DATABASE_URL` PostgreSQL connection URL.
- `better-auth.ts` — `BETTER_AUTH_SECRET` (minimum 32 characters), `BETTER_AUTH_URL`.
- `cors.ts` — `CORS_ALLOWED_ORIGINS` (default `http://localhost:35000`).
- `email.ts` — `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `NO_REPLY_EMAIL`; `INVITATION_EMAIL` is reserved and unused.
- `_types.ts` — shared result and environment types.
- `env.ts` — process environment source.
- `_index.ts` — validated configuration composition.

`lib/load-config.ts` owns only the shared typed Zod schema-loading operation. Only the config boundary reads `process.env`.

Keep local values in `apps/auth/.env` and safe placeholders in `.env.example`. Never log or commit database URLs, BetterAuth secrets, OTP codes, cookies, credentials, or session tokens.

## Request paths

```text
Health:
HTTP request → /health response ({ "status": "UP" })

Auth:
HTTP request → Hono/CORS boundary → /api/v1/auth/* → BetterAuth

Unknown:
HTTP request → 404 ({ "error": "Not found" })
```

Health is a liveness response and does not query the database. BetterAuth owns link issuance, link verification, sign-up, sign-in, sign-out, and current-session semantics at `basePath: /api/v1/auth`. Startup fails fast when the `auth` schema tables (`user`, `session`, `account`, `verification`) are missing.

Use explicit CORS origins with credentials. Do not add wildcard credentials behavior, expose infrastructure details, or call the PostgreSQL pool from a route handler.

## Safe responses

Configuration validation may fail fast at startup, but Zod details stay out of public responses. Return stable `404` responses for unknown routes. Never return SQL, credentials, session tokens, secrets, OTP codes, stack traces, or database URLs.
