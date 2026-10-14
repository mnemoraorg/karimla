# Error handling

- Domain services return typed sentinel errors defined in their feature package (e.g. `ErrNotFound`); cross-feature sentinels belong in `internal/shared/errors/` only when shared.
- Handlers map domain errors to HTTP status plus a stable envelope error code; messages stay user-safe. Infrastructure details (SQL, connection strings, stack traces) never leave the process — log them server-side instead.
- Common mapping: invalid input → `400`, missing session → `401`, forbidden → `403`, missing resource → `404`, conflicting state → `409`, downstream unavailable → `503`.
- Use `response.Failure`/`FailureWithError` for error envelopes and `response.Success` for ok envelopes; keep the `Log.event`/`user_id`/`status` fields truthful for clients that surface them.
- Validation failures name the field and the constraint; authorization failures stay generic.
