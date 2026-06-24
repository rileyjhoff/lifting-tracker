import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

// Browser Supabase client for Client Components (login/signup forms).
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
