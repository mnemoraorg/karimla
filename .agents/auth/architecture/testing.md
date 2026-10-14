# Testing

Use the narrowest test tier that proves the behavior:

- `apps/auth/test/unit/` — pure configuration schemas and mappings plus the email sender against a fake client; no PostgreSQL.
- `apps/auth/test/integration/` — HTTP boundary, health, and CORS through `createApp` with a stub handler.
- `apps/auth/test/e2e/` — email-OTP sign-up/sign-in through BetterAuth's in-memory adapter: code request, code verification, session cookie.

Current files: `test/unit/config.test.ts`, `test/unit/mailing/cloudflare-email-sender.test.ts`, `test/integration/http.test.ts`, `test/e2e/auth.test.ts`.

Use BetterAuth's in-memory adapter when persistence is not the behavior under test. Add live PostgreSQL or real email tests only with an explicit provisioned integration environment, and never require developer-local credentials in unit tests.

Run the relevant checks from the repository root:

```sh
bun run --cwd apps/auth test
bun run --cwd apps/auth check-types
```
