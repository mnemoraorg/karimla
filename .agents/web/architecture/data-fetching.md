# Data fetching

## Layers

```text
components/ → hooks/api/ (React Query) → api/ (fetch) → auth service or Go API
```

- `api/auth/client.ts` owns the auth base URL, credentialed requests, and the 10s timeout. `authRequest` throws a typed `Error`; it never returns response envelopes.
- `api/auth/send-otp.ts` and `api/auth/sign-in.ts` own one endpoint each: normalize input, post JSON, and map non-OK responses to form-ready messages (rate limits get their own message).
- `hooks/api/auth/` wraps each request function in one `useMutation` with no retry. Hooks own no URLs, no fetch, and no message copy beyond what the API module throws.
- Count mutations apply optimistically: `onMutate` cancels the group query, snapshots it, and sets the adjusted count from `lib/group-counts.ts`; `onError` restores the snapshot; `onSettled` invalidates so success and failure both resync from the server. Count requests stamp one `Idempotency-Key` UUID per tap so a retried request replays instead of counting again. Count failures are mapped to actionable copy in `api/groups.ts` (unreachable service, 5xx); anything the service judged keeps its own message.
- Components call hooks, read `isPending` for button state, and render `error.message`. No component imports from `api/` or calls `fetch`.

## Client state

- `providers/query-provider.tsx` owns the shared `QueryClient` (no retries, no refetch on window focus).
- The root layout mounts it inside the tooltip provider and around page content.
- Form state (step, email, code, error) lives in the form component; the pending email additionally lives in session storage for refresh survival.

## Configuration

- The auth and API base URLs come from required `NEXT_PUBLIC_*_URL_V1` variables validated by `apps/web/lib/env.ts`; each includes the `/api/v1` prefix.
- Document the contract in `apps/web/.env.example`; deployment must set all four variables at build time.
