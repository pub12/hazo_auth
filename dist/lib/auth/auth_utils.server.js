// file_description: server-side authentication utilities for checking login status in API routes
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "hazo_auth/lib/hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { map_db_source_to_ui } from "hazo_auth/lib/services/profile_picture_source_mapper";
// section: helpers
/**
 * Clears authentication cookies from response
 * @param response - NextResponse object to clear cookies from
 * @returns The response with cleared cookies
 */
function clear_auth_cookies(response) {
    response.cookies.set("hazo_auth_user_email", "", {
        expires: new Date(0),
        path: "/",
    });
    response.cookies.set("hazo_auth_user_id", "", {
        expires: new Date(0),
        path: "/",
    });
    return response;
}
// section: functions
/**
 * Checks if a user is authenticated from request cookies
 * Validates user exists, is active, and cookies match
 * @param request - NextRequest object
 * @returns AuthResult with user info or authenticated: false
 */
export async function get_authenticated_user(request) {
    var _a, _b;
    const user_id = (_a = request.cookies.get("hazo_auth_user_id")) === null || _a === void 0 ? void 0 : _a.value;
    const user_email = (_b = request.cookies.get("hazo_auth_user_email")) === null || _b === void 0 ? void 0 : _b.value;
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
        // Check if user is active
        if (user.is_active === false) {
            return { authenticated: false };
        }
        // Map database profile_source to UI representation
        const profile_source_db = user.profile_source;
        const profile_source_ui = profile_source_db ? map_db_source_to_ui(profile_source_db) : undefined;
        return {
            authenticated: true,
            user_id: user.id,
            email: user.email_address,
            name: user.name || undefined,
            email_verified: user.email_verified === true,
            is_active: user.is_active === true,
            last_logon: user.last_logon || undefined,
            profile_picture_url: user.profile_picture_url || undefined,
            profile_source: profile_source_ui,
        };
    }
    catch (error) {
        return { authenticated: false };
    }
}
/**
 * Checks if user is authenticated (simple boolean check)
 * @param request - NextRequest object
 * @returns true if authenticated, false otherwise
 */
export async function is_authenticated(request) {
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
export async function require_auth(request) {
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
export async function get_authenticated_user_with_response(request) {
    var _a, _b;
    const user_id = (_a = request.cookies.get("hazo_auth_user_id")) === null || _a === void 0 ? void 0 : _a.value;
    const user_email = (_b = request.cookies.get("hazo_auth_user_email")) === null || _b === void 0 ? void 0 : _b.value;
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
            const response = NextResponse.json({ authenticated: false }, { status: 200 });
            clear_auth_cookies(response);
            return { auth_result: { authenticated: false }, response };
        }
        const user = users[0];
        // Check if user is still active
        if (user.is_active === false) {
            // User is inactive - clear cookies
            const response = NextResponse.json({ authenticated: false }, { status: 200 });
            clear_auth_cookies(response);
            return { auth_result: { authenticated: false }, response };
        }
        // Map database profile_source to UI representation
        const profile_source_db = user.profile_source;
        const profile_source_ui = profile_source_db ? map_db_source_to_ui(profile_source_db) : undefined;
        return {
            auth_result: {
                authenticated: true,
                user_id: user.id,
                email: user.email_address,
                name: user.name || undefined,
                email_verified: user.email_verified === true,
                is_active: user.is_active === true,
                last_logon: user.last_logon || undefined,
                profile_picture_url: user.profile_picture_url || undefined,
                profile_source: profile_source_ui,
            },
        };
    }
    catch (error) {
        // On error, assume not authenticated
        return { auth_result: { authenticated: false } };
    }
}
