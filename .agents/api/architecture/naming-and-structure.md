# Naming and structure

Use explicit feature directories and file names that state their responsibility. Do not add empty directories or placeholder files to mirror a diagram.

```text
apps/api/
├── cmd/api/main.go            process entrypoint: config → app → run
├── internal/app/app.go        composition root: Fiber, middleware, routes, shutdown
├── internal/config/config.go  environment parsing and validation
├── internal/delivery/http/route.go        /api group registration
├── internal/delivery/http/v1/router.go    /api/v1 routes and middleware wiring
├── internal/handler/<area>/   one file per HTTP operation area (health, counter)
├── internal/domain/<feature>/ models, service, errors, repository ports
├── internal/adapter/<name>/   Ent/PostgreSQL and external-service implementations
├── internal/middleware/<name>/ cross-cutting request behavior (auth, limits, IDs)
├── internal/shared/response/  envelope only: types, success, error, utils
├── ent/schema/                Ent schemas, starting with the first feature
└── test/unit/<mirror>/        tests mirroring internal/ responsibility
```

- Feature packages are named after the product capability (`counter`), not the transport (`counterHandler` is wrong; `handler/counter` holding translation is right).
- `adapter/postgres/store.go` owns the Ent client; per-feature persistence lives under `adapter/postgres/repository/` (e.g. `repository/counter.go`), one file per port implementation.
- Files are named after their single responsibility: `route.go` registers, `router.go` versions, `get.go` handles one read.
- Shared type-only or cross-feature helpers belong in `internal/shared/` only when at least two features genuinely use them.
- Test files live under `test/unit/<same-path>/` with the same base name plus `_test.go` (e.g. `route_test.go`); test packages are external (`package http_test`).
