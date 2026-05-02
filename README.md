# Pune Afterhours 🎵

A hyperlocal social discovery app for private flat gigs, terrace parties & BYOJ events in Pune.

The app reads and writes through Next.js API routes backed by JSON files in `data/`, so hosted events persist locally instead of living only as imported mock arrays.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)
- **Syne + DM Sans** (Google Fonts)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone browser or use browser dev tools in mobile view (375px width).

## Screens

| Route | Screen |
|---|---|
| `/` | Discover — map + event drawer |
| `/event/[id]` | Event detail + request entry |
| `/host` | Create event form |
| `/profile` | User profile + history |
| `/api/events` | List and create events |
| `/api/events/[id]` | Read one event |
| `/api/users/me` | Read the current profile |

## Project Structure

```
pune-afterhours/
├── app/
│   ├── globals.css          # Fonts, CSS variables, animations
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Discover (home)
│   ├── event/[id]/page.tsx  # Event detail
│   ├── host/page.tsx        # Create event
│   └── profile/page.tsx     # User profile
├── data/
│   ├── events.json          # Local event store
│   └── user.json            # Local current user profile
├── components/
│   ├── BottomNav.tsx        # Bottom navigation bar
│   ├── EventCard.tsx        # Event list card
│   └── MapView.tsx          # Interactive event map
└── lib/
    ├── data.ts              # Types, seed data, helpers
    └── store.ts             # Server-side JSON persistence
```

## Data Layer

- Discover loads live event records from `GET /api/events`.
- Event detail loads a single record from `GET /api/events/:id`.
- Host creates a persisted record with `POST /api/events`.
- Profile reads from `GET /api/users/me`.

This is suitable for local development and demos. For production deployment on Vercel or similar serverless hosts, replace `lib/store.ts` with a database-backed implementation because local filesystem writes are not durable there.

## Production Next Steps

### Backend (Supabase recommended)
1. Set up Supabase project at https://supabase.com
2. Enable PostGIS extension for geospatial queries
3. Create tables: `users`, `events`, `event_requests`, `ratings`
4. Enable Supabase Realtime for live map updates

### Auth
- Add Clerk or Supabase Auth
- Add Instagram OAuth for social profiles

### Maps
- Replace the SVG mock map with Mapbox GL JS
- Add real geolocation with `navigator.geolocation`
- Set up event pins as Mapbox markers

### Payments
- Integrate Razorpay for entry fees + cost splitting
- Add Razorpay Route for platform commission

### Identity Verification
- College verification: MeasureOne or Skillify APIs
- Age verification: Aadhaar eKYC via Mploychek

### Deploy
```bash
npm run build
# Deploy to Vercel: https://vercel.com
```

## Design System

All colors use CSS variables defined in `globals.css`:

```css
--bg: #0a0a0f
--surface: #12121a
--surface2: #1a1a26
--accent: #c8f564   /* lime green */
--accent2: #7c6cfc  /* purple */
--warm: #ff6b4a     /* coral */
--teal: #2de2c4
```

Fonts: **Syne** (headings) + **DM Sans** (body)
