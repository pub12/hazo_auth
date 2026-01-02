// file_description: API route handler for user logout
// section: imports
import { NextResponse } from "next/server";
import { create_app_logger } from "../../lib/app_logger.js";
import { get_filename, get_line_number } from "../../lib/utils/api_route_helpers.js";
import { get_auth_cache } from "../../lib/auth/auth_cache.js";
import { get_auth_utility_config } from "../../lib/auth_utility_config.server.js";
import { get_cookie_name, get_cookie_options, BASE_COOKIE_NAMES } from "../../lib/cookies_config.server.js";
// section: api_handler
export async function POST(request) {
    var _a, _b;
    const logger = create_app_logger();
    try {
        // Get user info from cookie before clearing (using configurable cookie names)
        const user_email = (_a = request.cookies.get(get_cookie_name(BASE_COOKIE_NAMES.USER_EMAIL))) === null || _a === void 0 ? void 0 : _a.value;
        const user_id = (_b = request.cookies.get(get_cookie_name(BASE_COOKIE_NAMES.USER_ID))) === null || _b === void 0 ? void 0 : _b.value;
        // Clear authentication cookies
        const response = NextResponse.json({
            success: true,
            message: "Logout successful",
        }, { status: 200 });
        // Clear cookies by setting them to expire in the past (with configurable domain)
        const clear_cookie_options = get_cookie_options({
            expires: new Date(0),
            path: "/",
        });
        response.cookies.set(get_cookie_name(BASE_COOKIE_NAMES.USER_EMAIL), "", clear_cookie_options);
        response.cookies.set(get_cookie_name(BASE_COOKIE_NAMES.USER_ID), "", clear_cookie_options);
        // Clear JWT session token cookie
        response.cookies.set(get_cookie_name(BASE_COOKIE_NAMES.SESSION), "", clear_cookie_options);
        // Clear NextAuth session cookies (for OAuth users)
        response.cookies.set("next-auth.session-token", "", {
            expires: new Date(0),
            path: "/",
        });
        response.cookies.set("next-auth.csrf-token", "", {
            expires: new Date(0),
            path: "/",
        });
        response.cookies.set("next-auth.callback-url", "", {
            expires: new Date(0),
            path: "/",
        });
        // Also clear secure cookie variants (used in production with HTTPS)
        response.cookies.set("__Secure-next-auth.session-token", "", {
            expires: new Date(0),
            path: "/",
        });
        response.cookies.set("__Secure-next-auth.csrf-token", "", {
            expires: new Date(0),
            path: "/",
        });
        response.cookies.set("__Secure-next-auth.callback-url", "", {
            expires: new Date(0),
            path: "/",
        });
        // Host-prefixed variants (for some NextAuth configurations)
        response.cookies.set("__Host-next-auth.csrf-token", "", {
            expires: new Date(0),
            path: "/",
        });
        // Invalidate user cache
        if (user_id) {
            try {
                const config = get_auth_utility_config();
                const cache = get_auth_cache(config.cache_max_users, config.cache_ttl_minutes, config.cache_max_age_minutes);
                cache.invalidate_user(user_id);
            }
            catch (cache_error) {
                // Log but don't fail logout if cache invalidation fails
                const cache_error_message = cache_error instanceof Error
                    ? cache_error.message
                    : "Unknown error";
                logger.warn("logout_cache_invalidation_failed", {
                    filename: get_filename(),
                    line_number: get_line_number(),
                    user_id,
                    error: cache_error_message,
                });
            }
        }
        if (user_email || user_id) {
            logger.info("logout_successful", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id: user_id || "unknown",
                email: user_email || "unknown",
            });
        }
        return response;
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("logout_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Logout failed. Please try again." }, { status: 500 });
    }
}
