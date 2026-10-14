# Web app instructions

## Component vs route placement

- Never create a page inside `components/`. Route pages live only in `app/` (e.g. `app/(auth)/login/page.tsx`).
- `components/` holds reusable building blocks only (e.g. `components/pages/login/_form/login-form.tsx`, `components/pages/login/_fields/login-field.tsx`).
- Colocate route-private building blocks in underscore-prefixed folders (`_form/`, `_fields/`) so they are not routable.
