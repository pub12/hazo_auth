import { NextRequest, NextResponse } from "next/server";
export type AuthUser = {
    authenticated: true;
    user_id: string;
    email: string;
    name?: string;
    email_verified: boolean;
    is_active: boolean;
    last_logon?: string;
    profile_picture_url?: string;
    profile_source?: "upload" | "library" | "gravatar" | "custom";
};
export type AuthResult = AuthUser | {
    authenticated: false;
};
/**
 * Checks if a user is authenticated from request cookies
 * Validates user exists, is active, and cookies match
 * @param request - NextRequest object
 * @returns AuthResult with user info or authenticated: false
 */
export declare function get_authenticated_user(request: NextRequest): Promise<AuthResult>;
/**
 * Checks if user is authenticated (simple boolean check)
 * @param request - NextRequest object
 * @returns true if authenticated, false otherwise
 */
export declare function is_authenticated(request: NextRequest): Promise<boolean>;
/**
 * Requires authentication - throws error if not authenticated
 * Use in API routes that require authentication
 * @param request - NextRequest object
 * @returns AuthUser (never returns authenticated: false, throws instead)
 * @throws Error if not authenticated
 */
export declare function require_auth(request: NextRequest): Promise<AuthUser>;
/**
 * Gets authenticated user and returns response with cleared cookies if invalid
 * Useful for /api/auth/me endpoint that needs to clear cookies on invalid auth
 * @param request - NextRequest object
 * @returns Object with auth_result and response (with cleared cookies if invalid)
 */
export declare function get_authenticated_user_with_response(request: NextRequest): Promise<{
    auth_result: AuthResult;
    response?: NextResponse;
}>;
//# sourceMappingURL=auth_utils.server.d.ts.map