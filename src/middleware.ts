import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-types";

/**
 * Next.js Middleware — Intercepts requests for server-side route gating.
 *
 * Architecture Notes:
 * ──────────────────
 * This middleware runs at the EDGE before any page or API route handler.
 * It enforces two concerns:
 *
 * 1. PREMIUM API PROTECTION:
 *    API routes under /api/billing/*, /api/reports/*, /api/insights/*
 *    require a valid session cookie. Without one, they return 401.
 *    The actual tier check happens inside each API handler via
 *    `assertAccess(userId, feature)` — the middleware only verifies
 *    the session cookie *exists* (JWT verification is too heavy for edge).
 *
 * 2. /premium ROUTE — No server block:
 *    The /premium route is explicitly ALLOWED without auth. It uses
 *    the DevPlanPreviewProvider (client-side) to set `tier = "premium"`,
 *    which unlocks UI features for preview. Server-side API endpoints
 *    still independently verify the JWT and enforce real usage limits,
 *    so this cannot be used to bypass metered features.
 *
 * Security Model:
 * ──────────────
 * - Client-side: `usePermissions().can(feature)` controls UI rendering.
 *   This is a UX convenience, not a security boundary.
 * - Server-side: Every API route that performs a privileged action
 *   calls `assertAccess(userId, feature)` which resolves the real
 *   subscription tier from the database. This is the security boundary.
 * - The /premium route preview only affects the CLIENT tier resolution.
 *   API calls from the /premium page still go through the real auth flow.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Protected API routes: require session cookie ───
  const protectedApiPrefixes = [
    "/api/billing/checkout",
    "/api/billing/portal",
    "/api/reports",
    "/api/insights",
    "/api/wearables",
    "/api/partners",
  ];

  const isProtectedApi = protectedApiPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtectedApi) {
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    // Session cookie exists — let the API handler do full JWT verification
    // and tier-level access checks via assertAccess().
    return NextResponse.next();
  }

  // ─── /premium route: always allowed (preview mode) ───
  // No server-side block. The DevPlanPreviewProvider handles client-side
  // feature toggling. API calls from this page still check real auth.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/billing/checkout/:path*",
    "/api/billing/portal/:path*",
    "/api/reports/:path*",
    "/api/insights/:path*",
    "/api/wearables/:path*",
    "/api/partners/:path*",
    "/premium/:path*",
  ],
};
