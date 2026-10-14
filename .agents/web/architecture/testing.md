# Testing

Use the narrowest test tier that proves the behavior:

- `apps/web/test/unit/` — API request functions and pure helpers run with `bun test`. Tests fake `globalThis.fetch` and assert normalized input, endpoint paths, credentials, and error mapping.
- `apps/web/test/integration/` — HTTP-boundary coverage against a running service. Reserved; do not create it until a real behavior needs it.
- `apps/web/test/e2e/` — full sign-in and route-guard flows. Reserved; do not create it until a real behavior needs it.

Current files: `test/unit/api/otp.test.mjs`, `test/unit/lib/session-user.test.mjs`.

Keep `next/*` imports out of unit-tested modules; put Next-dependent code behind pure modules like `lib/auth/session-user.ts`. Never require developer-local services or credentials in unit tests.

Run the relevant checks from the repository root:

```sh
bun run --cwd apps/web test
bunx tsc --noEmit -p apps/web/tsconfig.json
bun run --cwd apps/web build
```
