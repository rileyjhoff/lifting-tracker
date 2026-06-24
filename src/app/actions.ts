"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import type { Exercise } from "@/lib/types";

type DB = SupabaseClient<Database>;

// All mutations run through the cookie-bound server client, so RLS scopes every
// row to the signed-in user. Each action revalidates "/" so the calendar (and an
// open day dialog) re-render with fresh data afterward.

async function requireUserId(supabase: DB): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return user.id;
}

/** Find the user's workout for a date, creating an empty one if none exists. */
async function ensureWorkout(supabase: DB, dateISO: string): Promise<string> {
  const { data: existing, error: selErr } = await supabase
    .from("workouts")
    .select("id")
    .eq("workout_date", dateISO)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (selErr) throw new Error(selErr.message);
  if (existing) return existing.id;

  // user_id defaults to auth.uid() in the database.
  const { data, error } = await supabase
    .from("workouts")
    .insert({ workout_date: dateISO })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function addExerciseToDate(dateISO: string, exerciseId: string) {
  const supabase = await createClient();

  // Only allow attaching an exercise the user can actually read (a shared preset
  // or their own custom). This RLS-scoped lookup returns null for a foreign or
  // non-existent id, so we fail cleanly instead of creating a dangling row.
  const { data: ex } = await supabase
    .from("exercises")
    .select("id")
    .eq("id", exerciseId)
    .maybeSingle();
  if (!ex) throw new Error("Exercise not found.");

  const workoutId = await ensureWorkout(supabase, dateISO);

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

  const { error: setErr } = await supabase
    .from("sets")
    .insert({ workout_exercise_id: we.id, set_number: 1, unit: "lb" });
  if (setErr) throw new Error(setErr.message);

  revalidatePath("/");
}

export async function removeWorkoutExercise(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("workout_exercises").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function updateRest(
  id: string,
  restBetweenSetsSeconds: number | null,
  restAfterExerciseSeconds: number | null,
) {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { error } = await supabase.from("sets").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

/** Set the weight unit (lb/kg) for every set of an exercise at once. */
export async function setExerciseUnit(workoutExerciseId: string, unit: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sets")
    .update({ unit })
    .eq("workout_exercise_id", workoutExerciseId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function removeSet(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function updateWorkoutMeta(
  id: string,
  patch: { title?: string | null; notes?: string | null },
) {
  const supabase = await createClient();
  const { error } = await supabase.from("workouts").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function deleteWorkout(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

/** Create a custom exercise owned by the current user, then return it. */
export async function createCustomExercise(input: {
  name: string;
  primary_muscle: string;
  equipment: string;
}): Promise<Exercise> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const name = input.name.trim();
  if (!name) throw new Error("Exercise name is required.");

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      name,
      primary_muscle: input.primary_muscle,
      equipment: input.equipment,
      is_custom: true,
      user_id: userId,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/");
  return data;
}
