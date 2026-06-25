# @riley/auth

Reusable Supabase auth for Next.js (App Router). Extracted from the lifting
tracker so future apps get login + per-user data with almost no setup.

Reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Usage

**Server client** (Server Components / Actions / Route Handlers):

```ts
import { createServerSupabaseClient } from "@riley/auth/server";
import type { Database } from "@/lib/database.types";

export function createClient() {
  return createServerSupabaseClient<Database>();
}
```

**Browser client** (Client Components):

```ts
import { createBrowserSupabaseClient } from "@riley/auth/client";
```

**Session + route-guard proxy** (`src/proxy.ts`):

```ts
import { updateSession } from "@riley/auth/proxy";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return updateSession(request, { publicPaths: ["/login", "/auth"] });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
```

The consuming app must list this package in `transpilePackages` (it ships raw
TypeScript) so Next compiles it and inlines the `NEXT_PUBLIC_*` env vars.

## Per-user RLS template

Pair with the standard "owned by `user_id`" policies — each table carries a
`user_id uuid default auth.uid()` and policies scope to `auth.uid()`. See the
lifting tracker's `supabase/migrations/0005_auth_user_scoping.sql` for the
reference shape.
