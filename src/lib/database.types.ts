export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      exercises: {
        Row: {
          created_at: string
          equipment: string
          id: string
          is_custom: boolean
          name: string
          primary_muscle: string
        }
        Insert: {
          created_at?: string
          equipment: string
          id?: string
          is_custom?: boolean
          name: string
          primary_muscle: string
        }
        Update: {
          created_at?: string
          equipment?: string
          id?: string
          is_custom?: boolean
          name?: string
          primary_muscle?: string
        }
        Relationships: []
      }
      sets: {
        Row: {
          created_at: string
          id: string
          reps: number | null
          set_number: number
          unit: string
          weight: number | null
          workout_exercise_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reps?: number | null
          set_number: number
          unit?: string
          weight?: number | null
          workout_exercise_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reps?: number | null
          set_number?: number
          unit?: string
          weight?: number | null
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          position: number
          rest_after_exercise_seconds: number | null
          rest_between_sets_seconds: number | null
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          position?: number
          rest_after_exercise_seconds?: number | null
          rest_between_sets_seconds?: number | null
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          position?: number
          rest_after_exercise_seconds?: number | null
          rest_between_sets_seconds?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          title: string | null
          updated_at: string
          workout_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          title?: string | null
          updated_at?: string
          workout_date: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          title?: string | null
          updated_at?: string
          workout_date?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
