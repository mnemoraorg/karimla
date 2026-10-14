# Yappi API instructions

## Required context

Before changing API boundaries, routes, adapters, persistence, or auth behavior, read `.agents/api/AGENTS.md` and the relevant reference under `.agents/api/architecture/`.

## Scope

`apps/api/` is the Go/Fiber API. BetterAuth remains the identity and session owner, PostgreSQL remains the data store, Ent owns runtime persistence, and Atlas owns schema migrations.

## Boundaries

```text
delivery/http → handler → domain feature service → repository port → adapter → Ent/PostgreSQL
```

- `internal/app/` is the composition root and owns wiring, Fiber access logging, and graceful shutdown. Access logs must not include cookies, authorization headers, or request bodies.
- `internal/config/` owns environment parsing and validation.
- `internal/delivery/http/` owns Fiber route registration and versioning under `/api/v1`.
- `internal/handler/` translates HTTP requests and responses. Handlers must not query databases or orchestrate repositories.
- `internal/domain/<feature>/` owns business models, errors, use cases, and repository interfaces. Domain code must not import Fiber.
- `internal/adapter/` owns Ent/PostgreSQL and BetterAuth implementations. Keep Ent types inside adapters and map them to domain models at the repository boundary.
- `internal/shared/response/` owns the response envelope (`types.go`, `success_response.go`, `error_response.go`, `utils.go`). Do not place feature DTOs there.

Do not add handwritten runtime SQL, duplicate BetterAuth identity data, or run schema migrations during application startup. Do not add Redis, roles, or invitations without an explicit product decision.

## Persistence

Ent owns runtime persistence; Atlas owns migrations. Schemas live under `ent/schema/`; generated Ent output is ignored and must never be hand-edited or committed. Regenerate with `make generate` before building or testing code that imports generated packages.

## Test placement and structure

Every Go test belongs under `apps/api/test/`; do not add `_test.go` files beside production packages. Mirror the production responsibility under `test/unit/` (e.g. `test/unit/config/`, `test/unit/delivery/http/`), keep real-service coverage under `test/integration/`, and reserve `test/e2e/` for full application flows. Use external test packages such as `package config_test` so tests exercise public package boundaries.

## Configuration and secrets

Use `.env.example` as the configuration contract. Keep credentials in ignored `.env` files. Never commit `.env`, credentials, generated output, or local state.

The local API port is `35080`, recorded in `.docs/ports.md`. The auth service URL defaults to `http://localhost:35081`.

## Commands

Run from `apps/api/`:

```sh
make generate
make atlas/validate
make test
make build
make lint
make tidy
```

Stop every service started for a task and verify its port is free with `lsof` before finishing.
