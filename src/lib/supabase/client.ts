import { createBrowserSupabaseClient } from "@riley/auth/client";
import type { Database } from "@/lib/database.types";

/** App's typed browser Supabase client (wraps @riley/auth). */
export function createClient() {
  return createBrowserSupabaseClient<Database>();
}
