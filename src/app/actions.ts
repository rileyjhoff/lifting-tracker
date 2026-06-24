"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/db/client";
import type { Exercise } from "@/lib/types";

// All mutations live here as Server Actions. Each one revalidates "/" so the
// calendar (and any open day dialog) re-renders with fresh data afterward.

/** Find the workout for a date, creating an empty one if none exists. */
async function ensureWorkout(dateISO: string): Promise<string> {
  const { data: existing, error: selErr } = await supabase
    .from("workouts")
    .select("id")
    .eq("workout_date", dateISO)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (selErr) throw new Error(selErr.message);
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("workouts")
    .insert({ workout_date: dateISO })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

/** Add a catalog exercise to a date's workout (creating the workout + a first set). */
export async function addExerciseToDate(dateISO: string, exerciseId: string) {
  const workoutId = await ensureWorkout(dateISO);

  const { data: last } = await supabase
    .from("workout_exercises")
    .select("position")
    .eq("workout_id", workoutId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? -1) + 1;

  const { data: we, error } = await supabase
    .from("workout_exercises")
    .insert({ workout_id: workoutId, exercise_id: exerciseId, position })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  // Seed one empty set so the editor has a row to fill in.
  const { error: setErr } = await supabase
    .from("sets")
    .insert({ workout_exercise_id: we.id, set_number: 1, unit: "lb" });
  if (setErr) throw new Error(setErr.message);

  revalidatePath("/");
}

export async function removeWorkoutExercise(id: string) {
  const { error } = await supabase.from("workout_exercises").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function updateRest(
  id: string,
  restBetweenSetsSeconds: number | null,
  restAfterExerciseSeconds: number | null,
) {
  const { error } = await supabase
    .from("workout_exercises")
    .update({
      rest_between_sets_seconds: restBetweenSetsSeconds,
      rest_after_exercise_seconds: restAfterExerciseSeconds,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function addSet(workoutExerciseId: string) {
  const { data: last } = await supabase
    .from("sets")
    .select("set_number, unit, reps, weight")
    .eq("workout_exercise_id", workoutExerciseId)
    .order("set_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("sets").insert({
    workout_exercise_id: workoutExerciseId,
    set_number: (last?.set_number ?? 0) + 1,
    unit: last?.unit ?? "lb",
    reps: last?.reps ?? null,
    weight: last?.weight ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function updateSet(
  id: string,
  patch: { reps?: number | null; weight?: number | null; unit?: string },
) {
  const { error } = await supabase.from("sets").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

/** Set the weight unit (lb/kg) for every set of an exercise at once. */
export async function setExerciseUnit(workoutExerciseId: string, unit: string) {
  const { error } = await supabase
    .from("sets")
    .update({ unit })
    .eq("workout_exercise_id", workoutExerciseId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function removeSet(id: string) {
  const { error } = await supabase.from("sets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function updateWorkoutMeta(
  id: string,
  patch: { title?: string | null; notes?: string | null },
) {
  const { error } = await supabase.from("workouts").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function deleteWorkout(id: string) {
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

/** Create a custom exercise and return it so the caller can add it to a workout. */
export async function createCustomExercise(input: {
  name: string;
  primary_muscle: string;
  equipment: string;
}): Promise<Exercise> {
  const name = input.name.trim();
  if (!name) throw new Error("Exercise name is required.");

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      name,
      primary_muscle: input.primary_muscle,
      equipment: input.equipment,
      is_custom: true,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/");
  return data;
}
