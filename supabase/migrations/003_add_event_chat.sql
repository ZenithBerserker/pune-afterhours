-- Adds event chat support for existing installations.

create table if not exists public.event_chat_messages (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  message text not null check (char_length(message) <= 300),
  created_at timestamptz not null default now()
);

create index if not exists event_chat_messages_event_idx on public.event_chat_messages (event_id, created_at);

alter table public.event_chat_messages enable row level security;
