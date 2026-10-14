# Web instructions

These instructions apply to `apps/web/`. Read them before changing the web application. The scoped runtime instructions are in `apps/web/AGENTS.md`; ports are recorded in `.docs/ports.md`.

## Imports

Keep imports in this order:

1. A file directive such as `"use client"`, when needed.
2. External libraries and packages (`react`, `next/*`, `@tanstack/*`, and similar).
3. Shared workspace packages (`@packages/ui-w/...`, `@packages/metadata`, and similar).
4. Web API modules from `@/api/...`.
5. Web hooks from `@/hooks/...`.
6. Web providers, helpers, and state modules (`@/providers/...`, `@/lib/...`, and similar).
7. Local web components from `@/components/...`.

Use one blank line between groups. Use the configured `@/` alias for cross-directory web imports. Keep same-directory relative imports only for small internal modules where an alias would add no clarity.

## Structure

- Route pages live only in `app/` (e.g. `app/(auth)/login/page.tsx`, `app/(protected)/page.tsx`). Never create a page inside `components/`.
- Page-specific components belong under `components/pages/<page>/`.
- Use private underscored folders such as `_form/` and `_fields/` for page-local implementation pieces.
- HTTP request functions belong under `api/` (e.g. `api/auth/client.ts`, `api/auth/send-otp.ts`, `api/auth/sign-in.ts`).
- React Query wrappers belong under `hooks/api/` (e.g. `hooks/api/auth/use-send-otp.ts`, `hooks/api/auth/use-sign-in.ts`).
- Shared client providers belong under `providers/` (e.g. `providers/query-provider.tsx`).
- Components call hooks; never call API endpoints or `fetch` directly from a component.
- Reuse existing `@packages/ui-w` primitives before creating new web UI primitives.
- The login flow posts to the auth service at `NEXT_PUBLIC_AUTH_URL` (local default `http://localhost:35081`) and uses `/api/v1/auth` paths.

## Verification

Run the smallest relevant checks for web changes from the repository root:

```sh
bunx tsc --noEmit -p apps/web/tsconfig.json
bun run --cwd apps/web test
bun run --cwd apps/web build
```

Documentation-only changes require documentation formatting checks rather than application builds.
