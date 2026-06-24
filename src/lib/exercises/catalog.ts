import type { Exercise } from "@/lib/types";

// The canonical option sets for the catalog. Kept UI-free so this module can be
// lifted into a shared package later without dragging React along.
export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
] as const;

export const EQUIPMENT = [
  "Barbell",
  "Dumbbell",
  "Machine",
  "Cable",
  "Bodyweight",
  "Kettlebell",
  "Other",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
export type Equipment = (typeof EQUIPMENT)[number];

const MUSCLE_ORDER = new Map(MUSCLE_GROUPS.map((m, i) => [m, i]));

/** Stable sort key so custom muscles fall after the known groups, alphabetised. */
export function muscleSortIndex(muscle: string): number {
  return MUSCLE_ORDER.get(muscle as MuscleGroup) ?? MUSCLE_GROUPS.length;
}

/** Sort exercises by muscle group (canonical order) then name. */
export function sortExercises(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => {
    const byMuscle = muscleSortIndex(a.primary_muscle) - muscleSortIndex(b.primary_muscle);
    if (byMuscle !== 0) return byMuscle;
    if (a.primary_muscle !== b.primary_muscle)
      return a.primary_muscle.localeCompare(b.primary_muscle);
    return a.name.localeCompare(b.name);
  });
}
