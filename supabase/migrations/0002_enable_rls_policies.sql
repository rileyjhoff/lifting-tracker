alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.sets enable row level security;

-- Single-user app with no auth: the app talks to Supabase with the anon key,
-- so allow the anon (and authenticated) role full access. Access control for
-- this personal app is handled at the app layer, not the database.
create policy exercises_anon_all on public.exercises
  for all to anon, authenticated using (true) with check (true);
create policy workouts_anon_all on public.workouts
  for all to anon, authenticated using (true) with check (true);
create policy workout_exercises_anon_all on public.workout_exercises
  for all to anon, authenticated using (true) with check (true);
create policy sets_anon_all on public.sets
  for all to anon, authenticated using (true) with check (true);
