# Web architecture references

The active scoped instructions are in [`apps/web/AGENTS.md`](../../../apps/web/AGENTS.md) and [`.agents/web/AGENTS.md`](../AGENTS.md). These references describe the Vinext/React/Cloudflare web app; they are not a copy of the auth service architecture.

## References

- [Routing and session](routing-and-session.md) — route groups, server guards, and the login flow.
- [Data fetching](data-fetching.md) — `api/` → `hooks/api/` → component layers and React Query.
- [Naming and structure](naming-and-structure.md) — package layout and import conventions.
- [Testing](testing.md) — web-specific unit, integration, and end-to-end tiers.

## Current architecture

```text
Browser
    ↓
app/ routes (RSC pages, client components)
    ↓               ↓
lib/auth guards  api/ + hooks/api/
    ↓               ↓
BetterAuth get-session   BetterAuth OTP endpoints
```

The web app reads sessions and redirects; BetterAuth decides identity. The Go API owns the counter; friends data is still planned.
