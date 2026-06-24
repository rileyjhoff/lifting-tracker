-- Fix 1: a custom exercise can't be promoted into a globally-visible preset.
drop policy if exists exercises_update on public.exercises;
create policy exercises_update on public.exercises for update to authenticated
  using (user_id = auth.uid() and is_custom = true)
  with check (user_id = auth.uid() and is_custom = true);

-- Fix 2: a workout_exercise may only reference an exercise the user can read
-- (a shared preset or their own custom) — closes the FK-bypasses-RLS gap.
drop policy if exists workout_exercises_all on public.workout_exercises;
create policy workout_exercises_all on public.workout_exercises for all to authenticated
  using (
    exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
    and exists (
      select 1 from public.exercises e
      where e.id = exercise_id and (e.is_custom = false or e.user_id = auth.uid())
    )
  );
