# Web app instructions

## Required context

Before changing web structure, import conventions, or API/hook boundaries, read `.agents/web/AGENTS.md` and the relevant reference under `.agents/web/architecture/`.

## Scope

`apps/web/` is the Karimla web app on port `35000`, recorded in `.docs/ports.md`. It owns routes, presentation, and client session UX. BetterAuth (port `35081`) owns identity and session semantics; the Go API (planned, port `35080`) will own counter and friends data.

## Structure

- Route pages live only in `app/` (e.g. `app/(auth)/login/page.tsx`, `app/(protected)/page.tsx`).
- `components/` holds reusable building blocks only, with page-local pieces in underscore-prefixed folders (`_form/`, `_fields/`).
- `api/` holds HTTP request functions; `hooks/api/` holds React Query wrappers; components call hooks, never endpoints.
- `providers/` holds shared client providers; `lib/auth/` holds server session guards.
- `test/unit/` holds API-function and pure-helper tests.

## Commands

Run commands from the repository root:

```sh
bun run --cwd apps/web dev
bun run --cwd apps/web test
bunx tsc --noEmit -p apps/web/tsconfig.json
bun run --cwd apps/web build
```

`.env.example` documents configuration (`NEXT_PUBLIC_AUTH_URL`). Keep `.env`, secrets, build output, and local state out of commits.

## Testing

- `test/unit/` contains API-function and pure-helper tests run with `bun test`.
- Keep `next/*` imports out of unit-tested modules so `bun test` can load them.
