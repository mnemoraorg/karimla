# Configuration and infrastructure

## Configuration

`internal/config/config.go` is the only place that reads the environment:

- `ENVIRONMENT` (default `development`), `PORT` (default `35080`, validated 1–65535).
- `DATABASE_URL` for PostgreSQL; empty means unconfigured.
- `AUTH_BASE_URL` for the BetterAuth service (default `http://localhost:35081`, trailing slash trimmed).
- `CORS_*` allowlists with safe defaults for the local web app.

Parse with small helpers (`value`, `integer`, `boolean`, `list`); fail fast with a typed error naming the variable. Only the config boundary reads `process` environment; everything else receives a `config.Config`.

Keep local values in `apps/api/.env` and safe placeholders in `.env.example`. Never log or commit connection strings, tokens, or cookies.

## Infrastructure

- `internal/app/` builds the Fiber app (`karimla-api`), request logger, and CORS from config, registers routes, then serves on a `net.Listener`.
- Shutdown is graceful with a 10s timeout on SIGINT/SIGTERM; closers (future DB pools) are deferred in `Run`.
- Startup never runs schema migrations; apply Atlas migrations explicitly before starting against a new database.
- Timeouts on outbound calls (e.g. session validation against auth) must be explicit and short; never inherit the request context unbounded.
