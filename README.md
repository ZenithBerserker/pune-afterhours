# Pune Afterhours 🎵

Hyperlocal social discovery for private gigs, terrace parties, and BYOJ events in Pune.

This app is now production-oriented for web deployment with **Next.js + Vercel + Supabase**:
- Email/password signup + signin
- Protected host flow
- Persisted event requests
- Host request moderation (approve/reject)
- Event chat per event

## Tech Stack

- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- Supabase (Auth + Postgres)
- Vercel (recommended hosting)

## Local Setup

1) Install:

```bash
npm install
```

2) Create env file:

```bash
cp .env.example .env.local
```

3) Add these variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4) In Supabase SQL editor, run:
- `supabase/schema.sql` (fresh setup), or
- incremental migrations in `supabase/migrations/` for existing projects.

5) Start dev server:

```bash
npm run dev
```

## Main Routes

- `/` discover events
- `/login` signup/signin
- `/host` create event (auth required)
- `/event/[id]` event details, request entry, chat, host moderation
- `/profile` current signed-in profile

## API Routes

- `GET/POST /api/events`
- `GET /api/events/[id]`
- `GET/POST /api/events/[id]/request`
- `GET/PATCH /api/events/[id]/request/manage` (host only)
- `GET/POST /api/events/[id]/chat`
- `GET /api/users/me`
- `GET /api/auth/session`

## Deploy to Vercel

1) Push repo to GitHub.
2) Import project in Vercel.
3) Set environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4) Deploy.
5) Verify:
   - signup creates profile automatically
   - host route redirects guests to login
   - event requests persist
   - chat messages persist

## Production Checklist (Web)

- [ ] Configure Supabase Auth settings (email templates, redirect URLs)
- [ ] Enable bot protection/rate limiting on APIs
- [ ] Add error monitoring (Sentry)
- [ ] Add analytics (PostHog / Amplitude / Mixpanel)
- [ ] Add RLS policies for direct client queries if needed
- [ ] Add backup/restore policy for Postgres
- [ ] Set up moderation/admin tooling

## Design Tokens

Colors are defined in `app/globals.css` with CSS variables.
