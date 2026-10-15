create table if not exists public.groups (
    id uuid primary key,
    name text not null,
    phrase text not null,
    invite_code text not null unique,
    created_by text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create table if not exists public.group_members (
    id uuid primary key,
    group_id text not null,
    auth_user_id text not null,
    display_name text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint group_members_group_user_key unique (group_id, auth_user_id)
);
create table if not exists public.group_counts (
    id uuid primary key,
    group_id text not null,
    auth_user_id text not null,
    count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint group_counts_group_user_key unique (group_id, auth_user_id)
);
