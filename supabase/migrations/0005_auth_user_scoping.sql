-- Add ownership columns
alter table public.workouts
  add column user_id uuid not null default auth.uid() references auth.users(id) on delete cascade;
create index workouts_user_idx on public.workouts(user_id);

alter table public.exercises
  add column user_id uuid references auth.users(id) on delete cascade;
create index exercises_user_idx on public.exercises(user_id);

-- Per-user uniqueness for exercise names (preset rows have null user_id and are seeded once)
drop index if exists public.exercises_name_unique;
create unique index exercises_user_name_unique on public.exercises (user_id, lower(name));

-- Replace permissive anon policies with per-user authenticated policies
drop policy if exists exercises_anon_all on public.exercises;
drop policy if exists workouts_anon_all on public.workouts;
drop policy if exists workout_exercises_anon_all on public.workout_exercises;
drop policy if exists sets_anon_all on public.sets;

-- exercises: read shared presets + your own customs; write only your own customs
create policy exercises_select on public.exercises for select to authenticated
  using (is_custom = false or user_id = auth.uid());
create policy exercises_insert on public.exercises for insert to authenticated
  with check (user_id = auth.uid() and is_custom = true);
create policy exercises_update on public.exercises for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy exercises_delete on public.exercises for delete to authenticated
  using (user_id = auth.uid());

-- workouts: only your own
create policy workouts_all on public.workouts for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- workout_exercises: gated by owning the parent workout
create policy workout_exercises_all on public.workout_exercises for all to authenticated
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

-- sets: gated by owning the grandparent workout
create policy sets_all on public.sets for all to authenticated
  using (exists (select 1 from public.workout_exercises we join public.workouts w on w.id = we.workout_id where we.id = workout_exercise_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_exercises we join public.workouts w on w.id = we.workout_id where we.id = workout_exercise_id and w.user_id = auth.uid()));
