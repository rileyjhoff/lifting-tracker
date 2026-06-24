# Lifting Tracker

A clean, calendar-first lifting tracker with per-user accounts. Sign in, pull exercises
from a shared preset catalog (or add your own private custom ones) into a day's workout,
set how many sets/reps and the weight, and optionally record rest times between sets and
after each exercise. Built with Next.js + Supabase and deployed on Vercel.

## Stack

- **Next.js 16** (App Router, TypeScript) — Server Components + Server Actions
- **MUI** (Material UI) with light/dark mode
- **Supabase** — Postgres + Auth (email/password and Google), per-user row-level security
- **Vercel** for hosting

## Auth & data model

- **Auth**: Supabase Auth via `@supabase/ssr` (cookie sessions). Email/password and Google
  SSO. `src/proxy.ts` (Next 16 middleware) refreshes the session and gates routes; signed-out
  users are sent to `/login`.
- **Per-user isolation**: every workout is owned by `user_id`; RLS policies scope all reads
  and writes to `auth.uid()`. Preset exercises are shared and read-only; custom exercises are
  private to the user who created them.
- **Data model**: `exercises` (shared presets + per-user custom) → `workouts` (one per day,
  owned by a user) → `workout_exercises` (optional rest fields) → `sets` (reps, weight, unit).
  SQL lives in `supabase/migrations/` (`0001`–`0005`).

## Key files

- `src/lib/supabase/{server,client}.ts` — cookie-bound server client + browser client
- `src/proxy.ts` — session refresh + route protection
- `src/app/login/page.tsx` — email/password + Google sign-in/up
- `src/app/auth/callback/route.ts` — OAuth / email-confirmation code exchange
- `src/app/page.tsx` — auth-guarded calendar home
- `src/app/actions.ts` — per-user Server Actions
- `src/components/*` — `CalendarMonth`, `WorkoutDialog`, `ExercisePicker`, `ExerciseSetsEditor`, `Header`

## Local development

Requires **Node 20+** (`.nvmrc` pins it — run `nvm use`).

```bash
nvm use
cp .env.example .env.local   # fill in your Supabase URL + publishable/anon key
npm install
npm run dev                  # http://localhost:3000
```

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

## Supabase configuration

1. Apply the migrations in `supabase/migrations/` in order (`0001` → `0005`).
2. **Auth → URL Configuration**: set the Site URL to your deployment, and add redirect URLs
   for `http://localhost:3000/**` and your production `/**`.
3. **Email/password**: optionally disable "Confirm email" (Auth → Providers → Email) for
   frictionless signup, or leave it on to require email confirmation.
4. **Google**: create a Google Cloud OAuth client, then enable Google in Auth → Providers and
   paste the client ID/secret. Authorized redirect URI is
   `https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback`.

## Deploy

Deployed on Vercel. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the
Vercel project's environment variables (Production), then deploy.
