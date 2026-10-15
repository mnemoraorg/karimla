# Authentication and authorization

BetterAuth is the identity and session owner; the API never verifies codes, mints sessions, or stores credentials.

- Protected route groups validate the session by calling the auth service (`AUTH_BASE_URL`, BetterAuth `get-session`) with forwarded cookies, on an explicit short timeout.
- The validated BetterAuth user ID becomes the request principal: an opaque string consumed as-is (e.g. the counter owner). The API must not create a `users` table or copy identity fields.
- Session failures map to transport outcomes: missing/invalid session → `401`; session-service unreachable → `503` with a safe message, never infrastructure details.
- Authorization (who may act on what) lives in domain services, not in middleware or handlers. Middleware establishes identity; domain decides access.
- Never read BetterAuth's database directly, even for convenience.
