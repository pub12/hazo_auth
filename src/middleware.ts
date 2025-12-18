// file_description: Next.js middleware for protecting routes based on authentication
// Note: Middleware runs in Edge Runtime, so it cannot use Node.js APIs (like SQLite)
// This middleware only checks for cookies - actual database validation happens in API routes
// section: imports
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validate_dev_lock_cookie } from "./lib/auth/dev_lock_validator.edge";

// section: helpers
/**
 * Checks if authentication cookies exist (lightweight check for Edge Runtime)
 * Does not validate against database - that happens in API routes
 * @param request - NextRequest object
 * @returns true if cookies exist, false otherwise
 */
function has_auth_cookies(request: NextRequest): boolean {
  const user_id = request.cookies.get("hazo_auth_user_id")?.value;
  const user_email = request.cookies.get("hazo_auth_user_email")?.value;
  
  return !!(user_id && user_email);
}

// section: middleware
/**
 * Next.js middleware function that runs on every request
 * Protects routes by checking for authentication cookies
 *
 * Note: This middleware runs in Edge Runtime and cannot access Node.js APIs (like SQLite)
 * It only checks if cookies exist - actual database validation happens in API routes
 *
 * Public routes (login, register, etc.) are allowed without authentication
 * Protected routes require authentication cookies and redirect to login if not present
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ============================================================
  // DEV LOCK CHECK (FIRST - zero overhead when disabled)
  // ============================================================
  // Fast-path: Check env var directly to avoid any overhead when disabled
  if (process.env.HAZO_AUTH_DEV_LOCK_ENABLED === "true") {
    // Allow dev lock routes through (needed to show lock screen and handle unlock)
    if (
      pathname === "/hazo_auth/dev_lock" ||
      pathname === "/api/hazo_auth/dev_lock"
    ) {
      return NextResponse.next();
    }

    // Allow static assets (needed for lock screen to render properly)
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon") ||
      pathname.endsWith(".png") ||
      pathname.endsWith(".jpg") ||
      pathname.endsWith(".svg") ||
      pathname.endsWith(".ico")
    ) {
      return NextResponse.next();
    }

    // Validate dev lock cookie
    const dev_lock_result = await validate_dev_lock_cookie(request);

    if (!dev_lock_result.valid) {
      // Not unlocked - block access
      if (pathname.startsWith("/api/")) {
        // API route - return 503 Service Unavailable with JSON
        return new NextResponse(
          JSON.stringify({
            error: "Service temporarily unavailable",
            code: "DEV_LOCK_ACTIVE",
            message: "Application is locked. Please unlock via /hazo_auth/dev_lock",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        // Page route - redirect to dev lock page
        return NextResponse.redirect(new URL("/hazo_auth/dev_lock", request.url));
      }
    }
  }
  // ============================================================
  // END DEV LOCK CHECK
  // ============================================================

  // Public routes that don't require authentication
  const public_routes = [
    "/hazo_auth/login",
    "/hazo_auth/register",
    "/hazo_auth/forgot_password",
    "/hazo_auth/reset_password",
    "/hazo_auth/verify_email",
    "/api/hazo_auth/login",
    "/api/hazo_auth/register",
    "/api/hazo_auth/forgot_password",
    "/api/hazo_auth/reset_password",
    "/api/hazo_auth/verify_email",
    "/api/hazo_auth/validate_reset_token",
    "/api/hazo_auth/resend_verification", // Allow resend verification email without auth
    "/api/hazo_auth/me", // Allow /api/hazo_auth/me to be public (returns authenticated: false if not logged in)
    "/api/hazo_auth/library_photos", // Allow library photos to be public (needed for profile picture picker)
    "/api/hazo_auth/library_photo", // Allow library photo serving to be public (serves from node_modules fallback)
    "/api/hazo_auth/oauth", // Allow OAuth callback routes
    "/api/auth", // NextAuth.js routes (OAuth providers, callbacks, etc.)
    "/hazo_connect/api/sqlite", // SQLite Admin API routes (admin tool, should be accessible)
    "/hazo_connect/sqlite_admin", // SQLite Admin UI page
    "/hazo_auth/logs", // Log viewer page (demo/testing)
    "/api/hazo_auth/logs", // Log viewer API (demo/testing)
  ];

  // Check if route is public
  const is_public_route = public_routes.some((route) => 
    pathname.startsWith(route)
  );

  // Allow public routes
  if (is_public_route) {
    return NextResponse.next();
  }

  // Check if authentication cookies exist (lightweight check)
  // Note: This doesn't validate against database - API routes will do that
  const has_cookies = has_auth_cookies(request);

  if (!has_cookies) {
    // Redirect to login if no cookies (not authenticated)
    const login_url = new URL("/hazo_auth/login", request.url);
    login_url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(login_url);
  }

  // Allow requests with cookies (actual validation happens in API routes)
  return NextResponse.next();
}

// section: config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - auth_images (public images)
     * - api/auth/me (public endpoint)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|auth_images).*)",
  ],
};

