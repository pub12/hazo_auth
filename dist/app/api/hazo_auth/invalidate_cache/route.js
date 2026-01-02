// file_description: API route for manual cache invalidation (admin endpoint)
// section: imports
import { NextResponse } from "next/server";
import { get_auth_cache } from "../../../../lib/auth/auth_cache.js";
import { get_auth_utility_config } from "../../../../lib/auth_utility_config.server.js";
import { create_app_logger } from "../../../../lib/app_logger.js";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers.js";
import { hazo_get_auth } from "../../../../lib/auth/hazo_get_auth.server.js";
// section: route_config
export const dynamic = "force-dynamic";
// section: api_handler
/**
 * POST - Manually invalidate auth cache
 * Body: { user_id?: string, role_ids?: number[], invalidate_all?: boolean }
 * Requires admin permission (checked via hazo_get_auth)
 */
export async function POST(request) {
    const logger = create_app_logger();
    try {
        // Check authentication and admin permission
        const auth_result = await hazo_get_auth(request, {
            required_permissions: ["admin_user_management"], // Require admin permission
            strict: true, // Throw error if not authorized
        });
        if (!auth_result.authenticated) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const body = await request.json();
        const { user_id, role_ids, invalidate_all } = body;
        // Validate input
        if (invalidate_all !== undefined && typeof invalidate_all !== "boolean") {
            return NextResponse.json({ error: "invalidate_all must be a boolean" }, { status: 400 });
        }
        if (user_id !== undefined && typeof user_id !== "string") {
            return NextResponse.json({ error: "user_id must be a string" }, { status: 400 });
        }
        if (role_ids !== undefined &&
            (!Array.isArray(role_ids) ||
                !role_ids.every((id) => typeof id === "number"))) {
            return NextResponse.json({ error: "role_ids must be an array of numbers" }, { status: 400 });
        }
        const config = get_auth_utility_config();
        const cache = get_auth_cache(config.cache_max_users, config.cache_ttl_minutes, config.cache_max_age_minutes);
        // Perform invalidation
        if (invalidate_all === true) {
            cache.invalidate_all();
            logger.info("auth_cache_invalidated_all", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id: auth_result.user.id,
            });
        }
        else if (user_id) {
            cache.invalidate_user(user_id);
            logger.info("auth_cache_invalidated_user", {
                filename: get_filename(),
                line_number: get_line_number(),
                invalidated_user_id: user_id,
                admin_user_id: auth_result.user.id,
            });
        }
        else if (role_ids && role_ids.length > 0) {
            cache.invalidate_by_roles(role_ids);
            logger.info("auth_cache_invalidated_roles", {
                filename: get_filename(),
                line_number: get_line_number(),
                role_ids,
                admin_user_id: auth_result.user.id,
            });
        }
        else {
            return NextResponse.json({
                error: "Must provide user_id, role_ids, or invalidate_all=true",
            }, { status: 400 });
        }
        return NextResponse.json({
            success: true,
            message: "Cache invalidated successfully",
        }, { status: 200 });
    }
    catch (error) {
        // Handle PermissionError (strict mode)
        if (error instanceof Error && error.name === "PermissionError") {
            return NextResponse.json({ error: "Permission denied. Admin access required." }, { status: 403 });
        }
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("auth_cache_invalidation_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to invalidate cache" }, { status: 500 });
    }
}
