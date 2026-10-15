# Naming and structure

Use route-grouped pages and layered client modules. Do not create pages inside `components/` or empty directories for symmetry.

```text
apps/web/
├── AGENTS.md
├── .env.example
├── api/
│   └── auth/
│       ├── client.ts
│       ├── send-otp.ts
│       └── sign-in.ts
├── app/
│   ├── layout.tsx
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   └── (protected)/
│       ├── layout.tsx
│       ├── page.tsx
│       └── groups/
│           ├── new/
│           │   └── page.tsx
│           ├── join/
│           │   └── page.tsx
│           └── [id]/
│               └── page.tsx
├── api/
│   ├── client.ts
│   ├── groups.ts
│   └── auth/
│       ├── client.ts
│       ├── send-otp.ts
│       ├── session.ts
│       ├── sign-in.ts
│       └── sign-out.ts
├── components/
│   ├── pages/
│   │   ├── home/
│   │   │   └── _groups/
│   │   │       └── groups-view.tsx
│   │   ├── groups/
│   │   │   ├── _detail/
│   │   │   │   └── group-detail-view.tsx
│   │   │   ├── _fields/
│   │   │   │   ├── group-name-field.tsx
│   │   │   │   ├── group-phrase-field.tsx
│   │   │   │   └── invite-code-field.tsx
│   │   │   ├── _form/
│   │   │   │   ├── create-group-form.tsx
│   │   │   │   └── join-group-form.tsx
│   │   │   └── _leaderboard/
│   │   │       └── leaderboard.tsx
│   │   └── login/
│   │       ├── _fields/
│   │       │   ├── login-field.tsx
│   │       │   └── otp-field.tsx
│   │       └── _form/
│   │           └── login-form.tsx
│   └── shared/
│       ├── _button/
│       │   ├── decrement-button.tsx
│       │   ├── increment-button.tsx
│       │   └── sign-out-button.tsx
│       └── _sheet/
│           └── user-sheet.tsx
├── hooks/
│   └── api/
│       ├── use-groups.ts
│       └── auth/
│           ├── use-send-otp.ts
│           ├── use-session.ts
│           ├── use-sign-in.ts
│           └── use-sign-out.ts
├── lib/
│   ├── auth/
│   │   ├── session.ts
│   │   └── session-user.ts
│   └── login.ts
├── providers/
│   └── query-provider.tsx
├── test/
│   └── unit/
│       ├── api/
│       │   ├── groups.test.mjs
│       │   ├── otp.test.mjs
│       │   └── session.test.mjs
│       └── lib/
│           ├── login.test.mjs
│           └── session-user.test.mjs
├── package.json
└── tsconfig.json
```

Responsibilities:

- `app/` owns routable pages only; `(auth)` and `(protected)` group by access, enforced by `lib/auth/` guards.
- `components/pages/<page>/` owns page-specific UI; underscore-prefixed `_form/`, `_fields/`, and `_button/` are non-routable implementation pieces, one component per file.
- `components/shared/` owns cross-page UI (`_sheet/`, `_button/`) with the same one-component-per-file rule.
- `api/` owns HTTP request functions and error mapping; `hooks/api/` owns React Query wrappers.
- `lib/auth/` owns server session reads (`session.ts`, Next imports allowed) and the pure session mapper (`session-user.ts`, no Next imports so `bun test` can load it).
- `providers/` owns shared client providers.
- `test/` mirrors behavior tiers, not production implementation directories.

Keep imports in this order:

1. A file directive such as `"use client"`, when needed.
2. External libraries and packages (`react`, `next/*`, `@tanstack/*`, and similar).
3. Custom web hooks from `@/hooks/...`.
4. Web API modules from `@/api/...`.
5. Web providers, helpers, and state modules (`@/providers/...`, `@/lib/...`, and similar).
6. Shared workspace components from `@packages/ui-w/...`.
7. Local web components from `@/components/...`.

Use one blank line between groups. Use the configured `@/` alias for cross-directory web imports. Keep same-directory relative imports only for small internal modules where an alias would add no clarity. Keep type-only imports in the group for the module they import from.
