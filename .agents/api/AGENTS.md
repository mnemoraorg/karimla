# Karimla Go API guidance

## Scope

`apps/api/` is the Go/Fiber API. BetterAuth remains the identity owner, PostgreSQL remains the data store, Ent will own runtime persistence, and Atlas will own schema migrations once the first schema lands.

The API serves the web app's business data (starting with the counter). It consumes opaque BetterAuth user IDs and must not duplicate identity tables or credentials.

## Required references

Read the relevant reference under [`architecture/`](architecture/_index.md) before changing a boundary, route, adapter, persistence mapping, authentication behavior, error contract, or test strategy. Read a guide under [`guides/`](guides/_template.md) when one exists for the feature's stable product rules.

## Recommended structure

```text
apps/api/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── app/
│   │   └── app.go
│   ├── config/
│   │   └── config.go
│   ├── adapter/        (added with the first persisted feature)
│   ├── delivery/
│   │   └── http/
│   │       ├── route.go
│   │       └── v1/
│   │           └── router.go
│   ├── handler/
│   │   └── health/
│   ├── domain/         (added with the first feature)
│   ├── middleware/     (added when cross-cutting behavior needs it)
│   └── shared/
│       └── response/
├── ent/                (added with the first schema)
├── test/
│   ├── unit/             package-level tests mirroring internal/
│   ├── integration/      database and external-service tests
│   └── e2e/              full HTTP/application flows
├── go.mod
├── Makefile
└── .env.example
```

Create feature directories when the feature lands; do not add empty directories or placeholder files only to mirror this diagram.

## Dependency direction

```text
delivery/http → handler → domain service → repository port → adapter/PostgreSQL or external service
```

- `internal/app/` is the composition root and owns dependency wiring and graceful shutdown.
- `internal/config/` owns environment parsing and validation.
- `internal/delivery/http/` owns Fiber route registration, versioning, and middleware wiring.
- `internal/handler/` translates HTTP requests and responses. Handlers must not query databases or orchestrate repositories.
- `internal/domain/<feature>/` will own business models, errors, use cases, and repository interfaces. Domain code must not import Fiber.
- `internal/adapter/` will own Ent/PostgreSQL and BetterAuth implementations.
- `internal/shared/` contains only genuinely shared contracts such as the response envelope.

Do not put HTTP handlers under `internal/domain/`; that couples business code to Fiber.

## Test placement and structure

- Every Go test belongs under `apps/api/test/`; do not add `_test.go` files beside production packages under `internal/` or `cmd/`.
- Mirror the production responsibility below `test/unit/`, for example `test/unit/config/` and `test/unit/delivery/http/`.
- Keep PostgreSQL and other real-service coverage under `test/integration/` with explicit build tags when it needs external services. Reserve `test/e2e/` for full application flows.
- Use external test packages such as `package config_test` and import the package under test; tests must not depend on unexported implementation details.

## Persistence rules

- Keep Ent schemas under `apps/api/ent/schema/` starting with the first persisted feature.
- Generated Ent output is ignored by the repository root `.gitignore`; never commit it.
- Ent describes the PostgreSQL schema and provides runtime persistence; it is not a second migration history.
- Atlas migrations will live under `apps/api/ent/migrate/migrations/` and are the API's schema authority.
- Keep BetterAuth as the identity/session owner; the API may call its service contract but must not read its database directly.

## Commands

Run from `apps/api/`:

```sh
make test
make build
make lint
make tidy
```

The development port is `35080`. Stop every service started or restarted for a task and verify its port is free before finishing.
