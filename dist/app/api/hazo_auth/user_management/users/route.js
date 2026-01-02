// file_description: API route for user management operations (list users, deactivate, reset password)
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../../lib/hazo_connect_instance.server.js";
import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../../../../../lib/app_logger.js";
import { get_filename, get_line_number } from "../../../../../lib/utils/api_route_helpers.js";
import { request_password_reset } from "../../../../../lib/services/password_reset_service.js";
import { get_auth_cache } from "../../../../../lib/auth/auth_cache.js";
import { get_auth_utility_config } from "../../../../../lib/auth_utility_config.server.js";
import { is_user_types_enabled, get_all_user_types, get_user_types_config, } from "../../../../../lib/user_types_config.server.js";
// section: route_config
export const dynamic = 'force-dynamic';
// section: api_handler
/**
 * GET - Fetch all users with details or a specific user by id
 * Query params: id (optional) - if provided, returns only that user
 */
export async function GET(request) {
    const logger = create_app_logger();
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get("id");
        const hazoConnect = get_hazo_connect_instance();
        const users_service = createCrudService(hazoConnect, "hazo_users");
        // Fetch users - filter by id if provided, otherwise get all
        const users = await users_service.findBy(user_id ? { id: user_id } : {});
        if (!Array.isArray(users)) {
            return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
        }
        logger.info("user_management_users_fetched", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_count: users.length,
        });
        // Check if user types feature is enabled
        const user_types_enabled = is_user_types_enabled();
        const available_user_types = user_types_enabled
            ? get_all_user_types().map((t) => ({
                key: t.key,
                label: t.label,
                badge_color: t.badge_color,
            }))
            : [];
        return NextResponse.json({
            success: true,
            user_types_enabled,
            available_user_types,
            users: users.map((user) => {
                // Parse app_user_data if it's a string (JSON stored as TEXT in DB)
                let app_user_data = null;
                if (user.app_user_data) {
                    if (typeof user.app_user_data === "string") {
                        try {
                            app_user_data = JSON.parse(user.app_user_data);
                        }
                        catch (_a) {
                            app_user_data = null;
                        }
                    }
                    else {
                        app_user_data = user.app_user_data;
                    }
                }
                return {
                    id: user.id,
                    name: user.name || null,
                    email_address: user.email_address,
                    email_verified: user.email_verified || false,
                    is_active: user.status === "active", // Derived from status column
                    last_logon: user.last_logon || null,
                    created_at: user.created_at || null,
                    profile_picture_url: user.profile_picture_url || null,
                    profile_source: user.profile_source || null,
                    user_type: user.user_type || null,
                    app_user_data,
                };
            }),
        }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("user_management_users_fetch_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
/**
 * PATCH - Update user (deactivate: set status to 'inactive', etc.)
 */
export async function PATCH(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { user_id, is_active, user_type, app_user_data } = body;
        // user_id is always required
        if (!user_id) {
            return NextResponse.json({ error: "user_id is required" }, { status: 400 });
        }
        // Build update object based on what's provided
        const update_data = {
            changed_at: new Date().toISOString(),
        };
        const hazoConnect = get_hazo_connect_instance();
        // Handle is_active if provided (maps to status column)
        if (typeof is_active === "boolean") {
            update_data.status = is_active ? "active" : "inactive";
        }
        // Handle app_user_data if provided
        if (app_user_data !== undefined) {
            // Allow null to clear, or set to JSON string
            if (app_user_data === null) {
                update_data.app_user_data = null;
            }
            else if (typeof app_user_data === "object" && !Array.isArray(app_user_data)) {
                update_data.app_user_data = JSON.stringify(app_user_data);
            }
            else {
                return NextResponse.json({ error: "app_user_data must be an object or null" }, { status: 400 });
            }
        }
        // Handle user_type if provided (only when feature is enabled)
        if (user_type !== undefined) {
            const config = get_user_types_config();
            if (config.enable_user_types) {
                // Allow null to clear the type, or validate type exists
                if (user_type === null || user_type === "") {
                    update_data.user_type = null;
                }
                else if (config.user_types.has(user_type)) {
                    update_data.user_type = user_type;
                }
                else {
                    return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
                }
            }
        }
        // Ensure there's something to update besides changed_at
        if (Object.keys(update_data).length === 1) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }
        const users_service = createCrudService(hazoConnect, "hazo_users");
        // Update user
        await users_service.updateById(user_id, update_data);
        // Invalidate caches
        let cache_invalidated = false;
        // Invalidate user auth cache if user deactivated or app_user_data changed
        if (is_active === false || app_user_data !== undefined) {
            try {
                const auth_config = get_auth_utility_config();
                const auth_cache = get_auth_cache(auth_config.cache_max_users, auth_config.cache_ttl_minutes, auth_config.cache_max_age_minutes);
                auth_cache.invalidate_user(user_id);
                cache_invalidated = true;
            }
            catch (cache_error) {
                // Log but don't fail user update if cache invalidation fails
                const cache_error_message = cache_error instanceof Error ? cache_error.message : "Unknown error";
                logger.warn("user_management_user_cache_invalidation_failed", {
                    filename: get_filename(),
                    line_number: get_line_number(),
                    user_id,
                    error: cache_error_message,
                });
            }
        }
        logger.info("user_management_user_updated", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id,
            updated_fields: Object.keys(update_data).filter((k) => k !== "changed_at"),
            cache_invalidated,
        });
        return NextResponse.json({ success: true }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("user_management_user_update_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
/**
 * POST - Send password reset email to user
 */
export async function POST(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { user_id } = body;
        if (!user_id) {
            return NextResponse.json({ error: "user_id is required" }, { status: 400 });
        }
        const hazoConnect = get_hazo_connect_instance();
        const users_service = createCrudService(hazoConnect, "hazo_users");
        // Get user by ID
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const user = users[0];
        const email = user.email_address;
        // Request password reset using existing service
        const result = await request_password_reset(hazoConnect, { email });
        if (!result.success) {
            logger.warn("user_management_password_reset_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id,
                email,
                error: result.error,
            });
            return NextResponse.json({ error: result.error || "Failed to send password reset email" }, { status: 500 });
        }
        logger.info("user_management_password_reset_sent", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id,
            email,
        });
        return NextResponse.json({ success: true }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("user_management_password_reset_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to send password reset email" }, { status: 500 });
    }
}
