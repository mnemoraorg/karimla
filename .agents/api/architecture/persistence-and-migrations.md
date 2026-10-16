# Persistence and migrations

Ent owns runtime persistence; Atlas owns schema migrations.

- Ent schemas live under `apps/api/ent/schema/` starting with `group.go`; the driver is pgx. Runtime code must use Ent through repository ports in adapters — never handwritten SQL in handlers or services.
- Generated Ent output is ignored by the root `.gitignore`; never hand-edit or commit it. Regenerate with `make generate` before building or testing code that imports generated packages.
- Atlas migrations live under `apps/api/ent/migrate/migrations/` with `atlas.sum` checksums; validate with `make atlas/validate` and apply explicitly with `make atlas/apply`. The database is shared with the BetterAuth `auth` schema, so applies allow unmanaged schemas. Never run migrations at application startup.
- The API owns only business tables (groups and their members, later friends). BetterAuth's `auth` schema is owned by the auth service; API migrations must not touch it.
- Column and table naming follows the existing database conventions: snake_case, matching the auth service.
