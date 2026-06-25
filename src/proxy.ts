import { updateSession } from "@riley/auth/proxy";
import type { NextRequest } from "next/server";

// Session refresh + route guarding now live in the reusable @riley/auth package.
export function proxy(request: NextRequest) {
  return updateSession(request, { publicPaths: ["/login", "/auth"] });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
