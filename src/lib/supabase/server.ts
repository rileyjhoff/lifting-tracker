import { createServerSupabaseClient } from "@riley/auth/server";
import type { Database } from "@/lib/database.types";

/** App's typed, cookie-bound Supabase server client (wraps @riley/auth). */
export function createClient() {
  return createServerSupabaseClient<Database>();
}
