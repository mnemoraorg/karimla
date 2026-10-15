create table if not exists public.counters (
    auth_user_id text primary key,
    count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
