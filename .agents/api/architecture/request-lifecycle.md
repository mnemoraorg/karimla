# Request lifecycle

```text
Request → Fiber middleware (logger, CORS) → route middleware (auth, idempotency)
  → handler (parse) → domain service (decide) → repository port
  → adapter (Ent/PostgreSQL or external call) → handler (map) → envelope JSON
```

- Middleware runs before routing logic: logging and CORS globally, then per-group behavior such as session validation on protected groups.
- Handlers parse and validate transport input, invoke one domain operation, and translate the result (or domain error) into a status code and envelope. No branching on business state in handlers beyond mapping.
- Domain services own the workflow: load state through repository ports, apply rules, persist decisions. They return typed domain errors, never HTTP statuses.
- Adapters translate at the boundary in both directions and surface infrastructure failures as repository errors the service maps.
- Responses always use the shared envelope; see [HTTP conventions](http-conventions.md) and [Error handling](error-handling.md).
