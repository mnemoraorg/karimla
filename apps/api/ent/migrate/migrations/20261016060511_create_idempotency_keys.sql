create table if not exists public.idempotency_keys (
    id uuid primary key,
    key_id text not null,
    endpoint text not null,
    auth_user_id text not null,
    status_code integer not null,
    body bytea not null,
    created_at timestamptz not null default now(),
    constraint idempotency_keys_key_endpoint_user_key unique (key_id, endpoint, auth_user_id)
);
