# Lifting Tracker

A clean, calendar-first lifting tracker. Pull exercises from a preset catalog into a
day's workout, set how many sets/reps and the weight, and optionally record rest times
between sets and after each exercise. Built as a single Next.js app (no auth — personal
use) backed by Supabase Postgres and deployed on Vercel.

## Stack

- **Next.js 16** (App Router, TypeScript) — Server Components + Server Actions
- **MUI** (Material UI) with light/dark mode
- **Supabase** (Postgres) — all access is server-side; DB keys never reach the browser
- **Vercel** for hosting

## Architecture

- `src/app/page.tsx` — server component; loads the visible month's workouts + the
  exercise catalog and renders the calendar.
- `src/app/actions.ts` — all mutations as Server Actions (create/update/delete workouts,
  exercises, sets). Each revalidates `/`.
- `src/lib/db/client.ts` — server-only Supabase client (the single DB seam).
- `src/lib/db/queries.ts` — typed reads.
- `src/lib/exercises/catalog.ts` — UI-free catalog helpers (kept extraction-ready).
- `src/components/*` — `CalendarMonth`, `WorkoutDialog`, `ExercisePicker`,
  `ExerciseSetsEditor`, `Header`.

### Data model

`exercises` (preset + custom) → `workouts` (one per day) → `workout_exercises`
(with optional `rest_between_sets_seconds` / `rest_after_exercise_seconds`) → `sets`
(`reps`, `weight`, `unit`). SQL lives in `supabase/migrations/`.

## Local development

Requires **Node 20+** (an `.nvmrc` pins it — run `nvm use`).

```bash
nvm use
cp .env.example .env.local   # then fill in your Supabase URL + key
npm install
npm run dev                  # http://localhost:3000
```

`.env.local`:

```
SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

## Database setup

The schema + seed are in `supabase/migrations/`, applied in order (`0001` → `0004`).
Apply them to a fresh Supabase project via the SQL editor or the Supabase CLI.

## Deploy

Pushed to GitHub and deployed on Vercel. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY`
in the Vercel project's environment variables (Production), then deploy.

## Note on access

This app has no login (single-user by design), so anyone with the URL can view and edit
data. The Supabase key stays server-only, but the app itself is open. To lock it down, add
a passcode gate in a Next.js proxy/middleware, enable Vercel password protection, or add
Supabase Auth.
