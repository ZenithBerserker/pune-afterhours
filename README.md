# Pune Afterhours 🎵

A hyperlocal social discovery app for private flat gigs, terrace parties & BYOJ events in Pune.

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
├── components/
│   ├── BottomNav.tsx        # Bottom navigation bar
│   ├── EventCard.tsx        # Event list card
│   └── MapView.tsx          # Interactive event map
└── lib/
    └── data.ts              # Types, mock data, helpers
```

## Next Steps to Make It Real

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
