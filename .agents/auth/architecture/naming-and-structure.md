# Naming and structure

Use intent-specific configuration files and behavior-tiered tests. Do not create MVC layers or empty feature directories for symmetry.

```text
apps/auth/
├── AGENTS.md
├── .env.example
├── config/
│   ├── _index.ts
│   ├── _types.ts
│   ├── app.ts
│   ├── better-auth.ts
│   ├── cors.ts
│   ├── db.ts
│   ├── email.ts
│   └── env.ts
├── db/
│   └── migrate.ts
├── lib/
│   └── load-config.ts
├── package.json
├── templates/
│   └── verification-otp.html
├── src/
│   ├── auth.ts
│   ├── http.ts
│   ├── mailing/
│   │   └── cloudflare-email-sender.ts
│   └── server.ts
├── test/
│   ├── e2e/
│   │   └── auth.test.ts
│   ├── integration/
│   │   └── http.test.ts
│   └── unit/
│       ├── config.test.ts
│       └── mailing/
│           └── cloudflare-email-sender.test.ts
└── tsconfig.json
```

Responsibilities:

- `config/` validates environment values and maps them to typed configuration.
- `db/` owns the auth service's BetterAuth schema migration runner, including the camelCase-to-snake_case column rename.
- `lib/load-config.ts` contains only shared config-loading behavior.
- `lib/logger.ts` contains only structured JSON event logging, email masking, and error describing.
- Shared type-only modules are always named `_types.ts`, never `types.ts`, so they sort before runtime modules.
- Directory composition modules are always named `_index.ts`, never `index.ts`, so they sort before runtime modules.
- Keep one exported function per focused module; compose functions from a separate module when a higher-level operation needs them.
- `templates/` contains static email HTML; mailing code replaces only explicit template placeholders.
- `src/auth.ts` composes BetterAuth, Kysely/PostgreSQL, and email delivery.
- `src/http.ts` composes the Hono app, routing, health, and CORS.
- `src/server.ts` owns Bun lifecycle and the fail-fast migration check.
- `test/` mirrors behavior tiers, not production implementation directories.

Keep package imports first, then add one blank line before relative internal imports. Keep type-only imports in the group for the module they import from.

## Future custom feature structure

When Karimla owns a real identity behavior that BetterAuth does not provide (for example invitations), add only the structure that feature needs:

```text
src/<feature>/
├── domain/
├── service/
├── route/
└── repository/ (when the feature owns persisted state)
```

- `domain/` contains pure business rules and models. It does not import HTTP, BetterAuth, or database clients.
- `service/` coordinates application behavior and owns the small dependency contracts it needs; it must not import database clients.
- `route/` parses HTTP requests, invokes one service, and maps safe responses.
- `repository/` hides feature-owned persistence.
- `mailing/` owns reusable email delivery across identity features.

Add a directory only when a real responsibility needs it. BetterAuth owns identity behavior, persistence, and identity IDs; the API consumes opaque user IDs without a duplicate users table.
