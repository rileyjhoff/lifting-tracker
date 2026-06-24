create extension if not exists "pgcrypto";

-- Exercise catalog (preset + custom)
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  primary_muscle text not null,
  equipment text not null,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index exercises_name_unique on public.exercises (lower(name));

-- A training session on a given date
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  workout_date date not null,
  title text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workouts_date_idx on public.workouts (workout_date);

-- An exercise pulled into a workout
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  position int not null default 0,
  rest_between_sets_seconds int,
  rest_after_exercise_seconds int,
  notes text,
  created_at timestamptz not null default now()
);
create index workout_exercises_workout_idx on public.workout_exercises (workout_id);

-- Individual sets within a workout exercise
create table public.sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  set_number int not null,
  reps int,
  weight numeric,
  unit text not null default 'lb',
  created_at timestamptz not null default now()
);
create index sets_workout_exercise_idx on public.sets (workout_exercise_id);

-- Keep workouts.updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workouts_set_updated_at
before update on public.workouts
for each row execute function public.set_updated_at();
