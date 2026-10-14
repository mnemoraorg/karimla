# Web app instructions

## Required context

Before changing web structure, import conventions, or API/hook boundaries, read `.agents/web/AGENTS.md` first.

## Component vs route placement

- Never create a page inside `components/`. Route pages live only in `app/` (e.g. `app/(auth)/login/page.tsx`).
- `components/` holds reusable building blocks only (e.g. `components/pages/login/_form/login-form.tsx`, `components/pages/login/_fields/login-field.tsx`).
- Colocate route-private building blocks in underscore-prefixed folders (`_form/`, `_fields/`) so they are not routable.

## API calls

- Put HTTP request functions in `api/` and React Query wrappers in `hooks/api/`.
- Components call hooks; never call API endpoints or `fetch` directly from a component.

## Testing

- Put tests under `test/unit/` (API functions, pure helpers) and run them with `bun run --cwd apps/web test`.
- Keep `next/*` imports out of unit-tested modules so `bun test` can load them.
