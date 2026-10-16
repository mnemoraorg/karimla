# HTTP conventions

- All routes live under `/api/v1`; `route.go` mounts the `/api` group and `v1/router.go` owns versioned registration.
- Health is `GET /api/v1/health` returning `{"status":"UP","groups":["liveness","readiness"]}`. It is a liveness signal, not a dependency check.
- Handlers return the shared envelope via `response.JSON(c, status, body)`; see `internal/shared/response/`.
- Validate transport input in the handler (types, required fields, ranges) and reject with `400` plus a stable error code before calling the service.
- Name routes after resources and intent (`GET /groups`, `POST /groups/:id/members/:userId/increment`), version once under `/v1`, and keep the frontend's exact paths stable once shipped.
- CORS and credentials behavior comes from config; access logs must not include cookies, authorization headers, or request bodies.
