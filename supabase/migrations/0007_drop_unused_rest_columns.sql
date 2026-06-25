-- Per-exercise rest is now captured in the free-text notes column, so the two
-- dedicated rest columns are no longer used by the app.
alter table public.workout_exercises
  drop column if exists rest_between_sets_seconds,
  drop column if exists rest_after_exercise_seconds;
