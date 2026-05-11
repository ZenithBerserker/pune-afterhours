-- Add this if your `events` table already exists WITHOUT `host_user_id` or missing `event_requests`.
-- Safe to run multiple times where supported.

alter table public.events add column if not exists host_user_id uuid references auth.users(id) on delete set null;

create index if not exists events_host_user_idx on public.events (host_user_id);

create table if not exists public.event_requests (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists event_requests_event_idx on public.event_requests (event_id);
create index if not exists event_requests_user_idx on public.event_requests (user_id);

alter table public.event_requests enable row level security;
