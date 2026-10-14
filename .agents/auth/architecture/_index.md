# Auth architecture references

The active scoped instructions are in [`apps/auth/AGENTS.md`](../../../apps/auth/AGENTS.md) and [`.agents/auth/AGENTS.md`](../AGENTS.md). These references describe the Bun/TypeScript/BetterAuth/Hono service; they are not a copy of the Go API architecture.

## References

- [Identity and boundaries](identity-and-boundaries.md) — BetterAuth ownership and dependency direction.
- [Runtime](runtime.md) — configuration, request handling, CORS, and safe responses.
- [Persistence](persistence.md) — PostgreSQL ownership and BetterAuth migrations.
- [Testing](testing.md) — auth-specific unit, integration, and end-to-end tiers.
- [Naming and structure](naming-and-structure.md) — package layout and import conventions.

Feature-specific product rules belong under `../guides/`. The directory remains empty until auth behavior is stable enough to guide future changes.

## Current architecture

```text
Bun HTTP server
        ↓
Hono HTTP/CORS boundary
        ↓
BetterAuth magic-link plugin
        ↓
Kysely/pg
        ↓
PostgreSQL auth schema
```

BetterAuth owns identity behavior and identity persistence. Karimla-owned code provides configuration, transport composition, and only the adapters BetterAuth does not provide (Cloudflare Email delivery). There is no Redis, no invitation service, and no internal service-token route.
