import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Server-only Supabase client. The key never reaches the browser — every read
// and write goes through Server Components or Server Actions. This is the single
// seam between the app and the database; to extract data access into a shared
// package later, this file plus `queries.ts` and `@/app/actions` move together.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill them in.",
  );
}

export const supabase = createClient<Database>(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
