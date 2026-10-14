# Identity and boundaries

BetterAuth is Karimla's canonical identity owner. It owns users, accounts, sessions, verification records, and opaque identity IDs. Sign-in is email-only through the `magicLink` plugin: one link request both signs up a new email and signs in an existing one. Passwords and OTP codes are out of scope.

The Go API owns counter and friends data only. It consumes the BetterAuth user ID as an opaque string and must not duplicate identity tables or credentials. The API must not read BetterAuth's database directly.

```text
Hono HTTP/CORS boundary → BetterAuth magic-link → Kysely/pg → PostgreSQL auth schema
```

## Ownership

- `src/server.ts` owns Bun startup, shutdown, and process lifecycle, including the fail-fast migration check.
- `src/http.ts` owns the Hono app, routing, health, CORS, and delegation to BetterAuth.
- `src/auth.ts` composes the PostgreSQL pool, Kysely dialect, Cloudflare email sender, and BetterAuth instance.
- `src/mailing/` owns email delivery; `templates/` owns static email HTML with explicit placeholders.
- `config/` owns environment schemas and typed configuration results.
- `db/` owns the BetterAuth schema migration runner.
- `test/` owns behavior-tiered tests; production code does not depend on test helpers.

## Forbidden dependencies

- HTTP code must not query PostgreSQL directly or implement password/session behavior.
- BetterAuth configuration must not contain unrelated business workflows (counters, friends, invitations).
- Config modules must not create feature behavior or read environment variables outside the config boundary.
- The API must not manage BetterAuth's `auth` schema.
- Tests must not require developer-local credentials unless they are explicit integration tests.
- Email sending must never log magic-link URLs, tokens, or credentials.

Do not add MVC, application/domain/port layers, or interfaces for symmetry. Add a custom boundary only when Karimla owns a real behavior that cannot remain in BetterAuth or a thin adapter.
