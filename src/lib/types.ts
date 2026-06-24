import type { Database } from "./database.types";

export type Exercise = Database["public"]["Tables"]["exercises"]["Row"];
export type Workout = Database["public"]["Tables"]["workouts"]["Row"];
export type WorkoutExerciseRow =
  Database["public"]["Tables"]["workout_exercises"]["Row"];
export type SetRow = Database["public"]["Tables"]["sets"]["Row"];

/** A workout_exercise joined with its catalog exercise and ordered sets. */
export type WorkoutExercise = WorkoutExerciseRow & {
  exercise: Exercise;
  sets: SetRow[];
};

/** A full workout with its ordered exercises and their sets. */
export type WorkoutDetail = Workout & {
  workout_exercises: WorkoutExercise[];
};
