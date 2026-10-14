# Layer boundaries

Dependencies flow one way:

```text
delivery/http → handler → domain service → repository port → adapter/PostgreSQL or external service
```

## Ownership

- `internal/app/` composes everything: Fiber instance, middleware, routes, and external clients. It is the only place that constructs adapters, services, and handlers together.
- `internal/delivery/http/` registers versioned routes (`/api/v1`) and wires middleware. It knows handler signatures, nothing about business rules.
- `internal/handler/` translates HTTP into service calls and service results into responses. Handlers parse input, call exactly one service operation, and map output. They must not query databases, call external services directly, or orchestrate repositories.
- `internal/domain/<feature>/` owns models, use cases, authorization decisions, and repository interfaces (ports). It must not import Fiber, Ent, or any transport/persistence package.
- `internal/adapter/` implements repository ports with Ent/PostgreSQL and external clients such as BetterAuth. Adapters map Ent rows to domain models at the boundary; Ent types must not leak into handlers or domain code. Repositories stay mechanical (queries, constraint handling, row mapping): creation defaults belong to the port contract and multi-repository flows belong to the domain service.
- `internal/shared/` holds only genuinely shared contracts (response envelope). Feature DTOs and business errors stay in their feature package.

## Forbidden dependencies

- No imports pointing upward: domain never imports handler, delivery, adapter, or app.
- No HTTP types in domain code; no database clients in handlers.
- No business rules in transport, configuration, or deployment layers.
- Do not create layers, facades, or interfaces for symmetry; add a boundary only when a real responsibility needs it.
