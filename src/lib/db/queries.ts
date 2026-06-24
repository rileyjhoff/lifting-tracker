import "server-only";

import { supabase } from "./client";
import type { Exercise, WorkoutDetail } from "@/lib/types";

/**
 * Fetch every workout whose date falls within [startISO, endISO] (inclusive),
 * each with its ordered exercises and sets. Dates are 'YYYY-MM-DD' strings.
 */
export async function getWorkoutsInRange(
  startISO: string,
  endISO: string,
): Promise<WorkoutDetail[]> {
  const { data, error } = await supabase
    .from("workouts")
    .select("*, workout_exercises(*, exercise:exercises(*), sets(*))")
    .gte("workout_date", startISO)
    .lte("workout_date", endISO)
    .order("workout_date", { ascending: true });

  if (error) throw new Error(`Failed to load workouts: ${error.message}`);

  const workouts = (data ?? []) as unknown as WorkoutDetail[];

  // Order nested collections in JS — reliable across deep relations.
  for (const workout of workouts) {
    workout.workout_exercises.sort((a, b) => a.position - b.position);
    for (const we of workout.workout_exercises) {
      we.sets.sort((a, b) => a.set_number - b.set_number);
    }
  }

  return workouts;
}

/** The full exercise catalog (presets + custom), sorted for grouped display. */
export async function getExerciseCatalog(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("primary_muscle", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load exercises: ${error.message}`);
  return data ?? [];
}
