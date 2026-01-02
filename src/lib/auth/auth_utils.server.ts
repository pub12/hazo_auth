// file_description: server-side authentication utilities for checking login status in API routes
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { map_db_source_to_ui } from "../services/profile_picture_source_mapper";
import { get_cookie_name, get_cookie_options, BASE_COOKIE_NAMES } from "../cookies_config.server";

// section: types
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

export type AuthResult = 
  | AuthUser
  | { authenticated: false };

// section: helpers
/**
 * Clears authentication cookies from response (with configurable prefix and domain)
 * @param response - NextResponse object to clear cookies from
 * @returns The response with cleared cookies
 */
function clear_auth_cookies(response: NextResponse): NextResponse {
  const clear_cookie_options = get_cookie_options({
    expires: new Date(0),
    path: "/",
  });
  response.cookies.set(get_cookie_name(BASE_COOKIE_NAMES.USER_EMAIL), "", clear_cookie_options);
  response.cookies.set(get_cookie_name(BASE_COOKIE_NAMES.USER_ID), "", clear_cookie_options);
  return response;
}

// section: functions
/**
 * Checks if a user is authenticated from request cookies
 * Validates user exists, is active, and cookies match
 * @param request - NextRequest object
 * @returns AuthResult with user info or authenticated: false
 */
export async function get_authenticated_user(request: NextRequest): Promise<AuthResult> {
  const user_id = request.cookies.get(get_cookie_name(BASE_COOKIE_NAMES.USER_ID))?.value;
  const user_email = request.cookies.get(get_cookie_name(BASE_COOKIE_NAMES.USER_EMAIL))?.value;

  if (!user_id || !user_email) {
    return { authenticated: false };
  }

  try {
    const hazoConnect = get_hazo_connect_instance();
    const users_service = createCrudService(hazoConnect, "hazo_users");
    
    const users = await users_service.findBy({
      id: user_id,
      email_address: user_email,
    });

    if (!Array.isArray(users) || users.length === 0) {
      return { authenticated: false };
    }

    const user = users[0];

    // Check if user is active (status must be 'ACTIVE')
    if (user.status !== "ACTIVE") {
      return { authenticated: false };
    }

    // Map database profile_source to UI representation
    const profile_source_db = user.profile_source as string | null | undefined;
    const profile_source_ui = profile_source_db ? map_db_source_to_ui(profile_source_db) : undefined;

    return {
      authenticated: true,
      user_id: user.id as string,
      email: user.email_address as string,
      name: (user.name as string | null | undefined) || undefined,
      email_verified: user.email_verified === true,
      is_active: user.status === "ACTIVE", // Derived from status column
      last_logon: (user.last_logon as string | null | undefined) || undefined,
      profile_picture_url: (user.profile_picture_url as string | null | undefined) || undefined,
      profile_source: profile_source_ui,
    };
  } catch (error) {
    return { authenticated: false };
  }
}

/**
 * Checks if user is authenticated (simple boolean check)
 * @param request - NextRequest object
 * @returns true if authenticated, false otherwise
 */
export async function is_authenticated(request: NextRequest): Promise<boolean> {
  const result = await get_authenticated_user(request);
  return result.authenticated;
}

/**
 * Requires authentication - throws error if not authenticated
 * Use in API routes that require authentication
 * @param request - NextRequest object
 * @returns AuthUser (never returns authenticated: false, throws instead)
 * @throws Error if not authenticated
 */
export async function require_auth(request: NextRequest): Promise<AuthUser> {
  const result = await get_authenticated_user(request);
  
  if (!result.authenticated) {
    throw new Error("Authentication required");
  }
  
  return result;
}

/**
 * Gets authenticated user and returns response with cleared cookies if invalid
 * Useful for /api/auth/me endpoint that needs to clear cookies on invalid auth
 * @param request - NextRequest object
 * @returns Object with auth_result and response (with cleared cookies if invalid)
 */
export async function get_authenticated_user_with_response(request: NextRequest): Promise<{
  auth_result: AuthResult;
  response?: NextResponse;
}> {
  const user_id = request.cookies.get(get_cookie_name(BASE_COOKIE_NAMES.USER_ID))?.value;
  const user_email = request.cookies.get(get_cookie_name(BASE_COOKIE_NAMES.USER_EMAIL))?.value;

  if (!user_id || !user_email) {
    return { auth_result: { authenticated: false } };
  }

  try {
    const hazoConnect = get_hazo_connect_instance();
    const users_service = createCrudService(hazoConnect, "hazo_users");
    
    const users = await users_service.findBy({
      id: user_id,
      email_address: user_email,
    });

    if (!Array.isArray(users) || users.length === 0) {
      // User not found - clear cookies
      const response = NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
      clear_auth_cookies(response);
      return { auth_result: { authenticated: false }, response };
    }

    const user = users[0];

    // Check if user is still active (status must be 'ACTIVE')
    if (user.status !== "ACTIVE") {
      // User is inactive - clear cookies
      const response = NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
      clear_auth_cookies(response);
      return { auth_result: { authenticated: false }, response };
    }

    // Map database profile_source to UI representation
    const profile_source_db = user.profile_source as string | null | undefined;
    const profile_source_ui = profile_source_db ? map_db_source_to_ui(profile_source_db) : undefined;

    return {
      auth_result: {
        authenticated: true,
        user_id: user.id as string,
        email: user.email_address as string,
        name: (user.name as string | null | undefined) || undefined,
        email_verified: user.email_verified === true,
        is_active: user.status === "ACTIVE", // Derived from status column
        last_logon: (user.last_logon as string | null | undefined) || undefined,
        profile_picture_url: (user.profile_picture_url as string | null | undefined) || undefined,
        profile_source: profile_source_ui,
      },
    };
  } catch (error) {
    // On error, assume not authenticated
    return { auth_result: { authenticated: false } };
  }
}

