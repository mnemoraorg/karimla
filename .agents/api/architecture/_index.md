# Go API architecture references

`AGENTS.md` is the active instruction entrypoint. Read the reference relevant to the code being changed; these documents explain the boundaries and decisions behind the rules.

## References

- [Layer boundaries](layer-boundaries.md) — ownership and allowed dependencies.
- [Naming and structure](naming-and-structure.md) — feature layout and explicit file names.
- [Request lifecycle](request-lifecycle.md) — route-to-response execution flow.
- [Configuration and infrastructure](configuration-and-infrastructure.md) — composition, clients, timeouts, and shutdown.
- [HTTP conventions](http-conventions.md) — Fiber routes, handlers, validation, and contracts.
- [Authentication and authorization](authentication-and-authorization.md) — BetterAuth, principals, and failures.
- [Persistence and migrations](persistence-and-migrations.md) — Ent boundaries and Atlas ownership.
- [Error handling](error-handling.md) — domain errors, safe messages, and status mapping.
- [Testing](testing.md) — test placement and verification.

## Feature guides

Feature guides describe stable product rules, not code layout. Read the relevant guide in addition to the architecture reference when one exists. Create new guides from `../guides/_template.md`; do not create a feature guide until its business rules are stable enough to guide future work.
