import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export interface AuthProxyOptions {
  /** Path prefixes that don't require auth. Default: ["/login", "/auth"]. */
  publicPaths?: string[];
  /** Where to send signed-out users. Default: "/login". */
  loginPath?: string;
  /** Where to send signed-in users who hit the login page. Default: "/". */
  homePath?: string;
}

/**
 * Refreshes the Supabase auth session on every request and gates access:
 * signed-out users are sent to `loginPath`, signed-in users are bounced off it.
 * Use from a Next.js 16 `proxy.ts` (or 15 `middleware.ts`). Real authorization
 * should still be enforced by RLS at the database.
 */
export async function updateSession(
  request: NextRequest,
  options: AuthProxyOptions = {},
) {
  const publicPaths = options.publicPaths ?? ["/login", "/auth"];
  const loginPath = options.loginPath ?? "/login";
  const homePath = options.homePath ?? "/";

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: nothing between client creation and getUser(), so the session
  // cookie is refreshed correctly.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = publicPaths.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  // Build a redirect that preserves any session cookies refreshed above.
  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value, c));
    return redirect;
  };

  if (!user && !isPublic) return redirectTo(loginPath);
  if (user && path === loginPath) return redirectTo(homePath);

  return response;
}
