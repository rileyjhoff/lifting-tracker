import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for Next.js Client Components (login/signup forms).
 * Pass your generated `Database` type for full typing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createBrowserSupabaseClient<DB = any>() {
  return createBrowserClient<DB>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
