# Testing

Use the narrowest test tier that proves the behavior:

- `apps/api/test/unit/` mirrors `internal/` responsibility (e.g. `test/unit/config/`, `test/unit/delivery/http/`). Tests use external packages (`package config_test`) and exercise public boundaries; HTTP boundary tests use `app.Test` with no network.
- `apps/api/test/integration/` covers PostgreSQL and external-service behavior with explicit build tags; it requires a reachable database and never runs by default.
- `apps/api/test/e2e/` covers full application flows and is reserved until one exists.

Current files: `test/unit/config/config_test.go`, `test/unit/delivery/http/route_test.go`.

Run from `apps/api/`:

```sh
make test
make lint
```

`make test` runs unit tests only. Never require developer-local services or credentials in unit tests; never send real OTPs or emails in tests.
