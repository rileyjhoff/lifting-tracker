import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cookie-bound Supabase client for Next.js Server Components, Server Actions,
 * and Route Handlers. Pass your generated `Database` type for full typing:
 *
 *   const supabase = await createServerSupabaseClient<Database>();
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createServerSupabaseClient<DB = any>() {
  const cookieStore = await cookies();

  return createServerClient<DB>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component where cookies are read-only —
            // session refresh is handled by the proxy instead.
          }
        },
      },
    },
  );
}
