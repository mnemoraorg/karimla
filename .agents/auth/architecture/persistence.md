# Persistence

BetterAuth is the sole owner of identity persistence.

```text
BetterAuth
    ↓
Kysely PostgreSQL dialect (pg Pool)
    ↓
PostgreSQL auth schema (schemaName: "auth")
```

The PostgreSQL pool and Kysely database are composed in `apps/auth/src/auth.ts`. BetterAuth's `schemaName: "auth"` keeps identity tables separate from future API business tables. All identity columns are snake_case (`access_token`, `user_id`, `email_verified`): `src/auth.ts` maps every BetterAuth camelCase model field to its snake_case column, and `db/migrate.ts` renames any legacy camelCase columns in place before migrating. Never reference camelCase column names in SQL, queries, or tooling; the mapping keys in `src/auth.ts` are BetterAuth model field names, not column names. `apps/auth/db/migrate.ts` wraps the version-matched BetterAuth migration API: `--generate` writes the reference SQL (ignored by git), and the default run applies migrations.

Run BetterAuth's migration command from the repository root:

```sh
bun run --cwd apps/auth db:migrate
```

The command requires a reachable PostgreSQL database. Do not manage BetterAuth tables with API migrations, hand-edit generated BetterAuth schema output, or create a second migration owner. Persistence tests belong in an explicit integration tier with provisioned infrastructure. Unit and end-to-end tests use fakes or BetterAuth's in-memory adapter when PostgreSQL behavior is not under test.
