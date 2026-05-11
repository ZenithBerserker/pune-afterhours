-- Pune Afterhours — Postgres schema + seed events (profiles come from Auth).
-- Run in Supabase Dashboard → SQL Editor as a NEW project setup.
--
-- Upgrading from an older text-id profiles setup? Backup data, drop public.profiles /
-- recreate and re-run migrate script in supabase/migrations/upgrade_v1_text_profiles.sql

-- ---------------------------------------------------------------------------
-- Profiles (linked 1:1 to auth.users via trigger)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  handle text not null,
  initials text not null,
  college text not null default '',
  college_verified boolean not null default false,
  kyc_verified boolean not null default false,
  events_attended int not null default 0,
  rating numeric not null default 5,
  events_hosted int not null default 0,
  attended_history jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id text primary key,
  name text not null,
  emoji text not null,
  vibe text[] not null,
  neighborhood text not null,
  time_display text not null,
  capacity int not null,
  attending int not null,
  female_count int not null,
  male_count int not null,
  access text not null,
  status text not null,
  entry text not null,
  host_name text not null,
  host_initials text not null,
  host_rating numeric not null,
  host_trusted boolean not null,
  description text not null,
  map_x double precision not null,
  map_y double precision not null,
  color text not null,
  created_at timestamptz,
  source text,
  host_user_id uuid references auth.users (id) on delete set null,
  constraint events_access_check check (access in ('public', 'mutual', 'invite')),
  constraint events_status_check check (status in ('open', 'almost', 'full')),
  constraint events_color_check check (color in ('accent', 'purple', 'warm', 'teal')),
  constraint events_source_check check (source is null or source in ('seed', 'user'))
);

create index if not exists events_created_at_idx on public.events (created_at desc nulls last);
create index if not exists events_host_user_idx on public.events (host_user_id);

-- ---------------------------------------------------------------------------
-- Entry requests (persisted guest flow)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Event chat
-- ---------------------------------------------------------------------------
create table if not exists public.event_chat_messages (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  message text not null check (char_length(message) <= 300),
  created_at timestamptz not null default now()
);

create index if not exists event_chat_messages_event_idx on public.event_chat_messages (event_id, created_at);

-- ---------------------------------------------------------------------------
-- RLS (your API uses the service role for writes; tighten policies when you expose anon reads)
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_requests enable row level security;
alter table public.event_chat_messages enable row level security;

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup (metadata: full_name, college optional)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  email_local text;
  initials_val text;
  space_pos int;
begin
  display_name := coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1));
  email_local := split_part(coalesce(new.email, 'user'), '@', 1);
  space_pos := position(' ' in display_name);

  if space_pos > 0 then
    initials_val := upper(
      substring(display_name from 1 for 1) ||
      substring(display_name from space_pos + 1 for 1)
    );
  else
    initials_val := upper(left(email_local, 2));
  end if;

  insert into public.profiles (
    id,
    name,
    handle,
    initials,
    college,
    college_verified,
    kyc_verified,
    events_attended,
    rating,
    events_hosted,
    attended_history
  )
  values (
    new.id,
    display_name,
    '@' || email_local,
    initials_val,
    coalesce(nullif(trim(new.raw_user_meta_data->>'college'), ''), ''),
    false,
    false,
    0,
    5,
    0,
    '[]'::jsonb
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Seed events (no synthetic profile — browse works before anyone signs up)
-- ---------------------------------------------------------------------------
insert into public.events (
  id, name, emoji, vibe, neighborhood, time_display, capacity, attending,
  female_count, male_count, access, status, entry, host_name, host_initials,
  host_rating, host_trusted, description, map_x, map_y, color, created_at, source, host_user_id
) values
(
  '1',
  'Rooftop Terrace Gig',
  '🎵',
  array['Terrace Gig','Acoustic','BYOJ']::text[],
  'Baner',
  '10:00 PM',
  25,
  18,
  9,
  9,
  'public',
  'open',
  'Free · BYOJ',
  'Aryan R.',
  'AR',
  4.9,
  true,
  $$Chill acoustic vibes on a rooftop in Baner. Bring your own juice, good music and good company guaranteed. Small gathering, verified guests only.$$,
  24,
  22,
  'accent',
  '2026-05-02T18:00:00.000+05:30'::timestamptz,
  'seed',
  null
),
(
  '2',
  'Poker Night',
  '🃏',
  array['Poker','BYOJ']::text[],
  'Wakad',
  '9:00 PM',
  12,
  8,
  3,
  5,
  'mutual',
  'almost',
  'Free',
  'Sneha K.',
  'SK',
  4.7,
  true,
  $$Friendly poker tournament with snacks. Beginners welcome. Mutual friends network only — keep it tight.$$,
  55,
  30,
  'purple',
  '2026-05-02T18:00:00.000+05:30'::timestamptz,
  'seed',
  null
),
(
  '3',
  'Late Night Techno',
  '🎧',
  array['Techno','Flat Party']::text[],
  'Kalyani Nagar',
  '11:00 PM',
  30,
  30,
  14,
  16,
  'invite',
  'full',
  '₹100 · BYOJ',
  'Rishi M.',
  'RM',
  4.5,
  false,
  $$Deep techno set in a proper flat setup. Strict invite-only. Noise compliance guaranteed — we wrap at 9:45 PM volume cutoff.$$,
  72,
  18,
  'teal',
  '2026-05-02T18:00:00.000+05:30'::timestamptz,
  'seed',
  null
),
(
  '4',
  'Acoustic Open Mic',
  '🎤',
  array['Open Mic','Acoustic','BYOJ']::text[],
  'FC Road',
  '8:00 PM',
  20,
  11,
  7,
  4,
  'public',
  'open',
  'Free',
  'Divya P.',
  'DP',
  5,
  true,
  $$Monthly open mic at a FC Road flat. Original songs, covers, poetry — all welcome. Very warm crowd.$$,
  14,
  52,
  'warm',
  '2026-05-02T18:00:00.000+05:30'::timestamptz,
  'seed',
  null
),
(
  '5',
  'FIFA + Pizza Night',
  '🍕',
  array['Flat Party','BYOJ']::text[],
  'Kothrud',
  '7:30 PM',
  16,
  10,
  4,
  6,
  'mutual',
  'open',
  'Free · BYOJ',
  'Kabir S.',
  'KS',
  4.8,
  true,
  $$FIFA tournament on the big screen. We're ordering pizzas together. Just bring your juice and your competitive spirit.$$,
  44,
  57,
  'accent',
  '2026-05-02T18:00:00.000+05:30'::timestamptz,
  'seed',
  null
)
on conflict (id) do nothing;
