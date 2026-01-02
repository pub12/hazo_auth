// file_description: API route handler for managing user roles (assigning roles to users)
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../lib/hazo_connect_instance.server";
import { createCrudService, getSqliteAdminService } from "hazo_connect/server";
import { create_app_logger } from "../../lib/app_logger";
import { get_filename, get_line_number } from "../../lib/utils/api_route_helpers";
import { get_auth_cache } from "../../lib/auth/auth_cache";
import { get_auth_utility_config } from "../../lib/auth_utility_config.server";
// section: route_config
export const dynamic = 'force-dynamic';
// section: api_handler
/**
 * GET - Get roles assigned to a user
 * Query params: user_id (string)
 */
export async function GET(request) {
    const logger = create_app_logger();
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get("user_id");
        if (!user_id || typeof user_id !== "string") {
            return NextResponse.json({ error: "user_id is required as a query parameter" }, { status: 400 });
        }
        const hazoConnect = get_hazo_connect_instance();
        const user_roles_service = createCrudService(hazoConnect, "hazo_user_roles");
        // Get all roles assigned to this user
        const user_roles = await user_roles_service.findBy({
            user_id,
        });
        if (!Array.isArray(user_roles)) {
            return NextResponse.json({ error: "Failed to fetch user roles" }, { status: 500 });
        }
        // Extract role IDs
        const role_ids = user_roles.map((ur) => ur.role_id).filter((id) => id !== undefined);
        return NextResponse.json({
            success: true,
            role_ids,
        }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("user_management_user_roles_fetch_failed", {
            filename: get_filename(),
            line_number: get_line_number(),
            error: error_message,
        });
        return NextResponse.json({ error: "Failed to fetch user roles" }, { status: 500 });
    }
}
/**
 * POST - Assign a role to a user
 * Body: { user_id: string, role_id: number }
 */
export async function POST(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { user_id, role_id } = body;
        if (!user_id || typeof user_id !== "string") {
            return NextResponse.json({ error: "user_id is required and must be a string" }, { status: 400 });
        }
        if (!role_id || typeof role_id !== "number") {
            return NextResponse.json({ error: "role_id is required and must be a number" }, { status: 400 });
        }
        const hazoConnect = get_hazo_connect_instance();
        const user_roles_service = createCrudService(hazoConnect, "hazo_user_roles");
        // Check if user exists
        const users_service = createCrudService(hazoConnect, "hazo_users");
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Check if role exists
        const roles_service = createCrudService(hazoConnect, "hazo_roles");
        const roles = await roles_service.findBy({ id: role_id });
        if (!Array.isArray(roles) || roles.length === 0) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }
        // Check if role is already assigned to user
        const existing_assignments = await user_roles_service.findBy({
            user_id,
            role_id,
        });
        if (Array.isArray(existing_assignments) && existing_assignments.length > 0) {
            return NextResponse.json({ error: "Role is already assigned to this user" }, { status: 409 });
        }
        // Assign role to user
        const now = new Date().toISOString();
        const new_assignment = await user_roles_service.insert({
            user_id,
            role_id,
            created_at: now,
            changed_at: now,
        });
        logger.info("user_management_user_role_assigned", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id,
            role_id,
            assignment_id: new_assignment.user_id,
        });
        return NextResponse.json({
            success: true,
            assignment: {
                user_id,
                role_id,
            },
        }, { status: 201 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("user_management_user_role_assign_failed", {
            filename: get_filename(),
            line_number: get_line_number(),
            error: error_message,
        });
        return NextResponse.json({ error: "Failed to assign role to user" }, { status: 500 });
    }
}
/**
 * PUT - Update user roles (bulk assignment/removal)
 * Body: { user_id: string, role_ids: number[] }
 */
export async function PUT(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { user_id, role_ids } = body;
        if (!user_id || typeof user_id !== "string") {
            return NextResponse.json({ error: "user_id is required and must be a string" }, { status: 400 });
        }
        if (!Array.isArray(role_ids)) {
            return NextResponse.json({ error: "role_ids is required and must be an array" }, { status: 400 });
        }
        const hazoConnect = get_hazo_connect_instance();
        const user_roles_service = createCrudService(hazoConnect, "hazo_user_roles");
        // Check if user exists
        const users_service = createCrudService(hazoConnect, "hazo_users");
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Get current user roles
        const current_user_roles = await user_roles_service.findBy({
            user_id,
        });
        if (!Array.isArray(current_user_roles)) {
            return NextResponse.json({ error: "Failed to fetch current user roles" }, { status: 500 });
        }
        const current_role_ids = current_user_roles.map((ur) => ur.role_id).filter((id) => id !== undefined);
        const target_role_ids = role_ids.filter((id) => typeof id === "number");
        // Find roles to add and remove
        const to_add = target_role_ids.filter((id) => !current_role_ids.includes(id));
        const to_remove = current_role_ids.filter((id) => !target_role_ids.includes(id));
        const now = new Date().toISOString();
        // Add new roles
        for (const role_id of to_add) {
            // Check if role exists
            const roles_service = createCrudService(hazoConnect, "hazo_roles");
            const roles = await roles_service.findBy({ id: role_id });
            if (Array.isArray(roles) && roles.length > 0) {
                await user_roles_service.insert({
                    user_id,
                    role_id,
                    created_at: now,
                    changed_at: now,
                });
            }
        }
        // Remove roles
        if (to_remove.length > 0) {
            try {
                const admin_service = getSqliteAdminService();
                for (const role_id of to_remove) {
                    await admin_service.deleteRows("hazo_user_roles", {
                        user_id,
                        role_id,
                    });
                }
            }
            catch (adminError) {
                const error_message = adminError instanceof Error ? adminError.message : "Unknown error";
                logger.warn("user_management_user_role_delete_admin_failed", {
                    filename: get_filename(),
                    line_number: get_line_number(),
                    error: error_message,
                    note: "Trying fallback method",
                });
                // Fallback
                for (const role_id of to_remove) {
                    const assignments_to_remove = await user_roles_service.findBy({
                        user_id,
                        role_id,
                    });
                    if (Array.isArray(assignments_to_remove) && assignments_to_remove.length > 0) {
                        for (const assignment of assignments_to_remove) {
                            try {
                                if (assignment.id !== undefined) {
                                    await user_roles_service.deleteById(assignment.id);
                                }
                                else if (assignment.rowid !== undefined) {
                                    await user_roles_service.deleteById(assignment.rowid);
                                }
                                else {
                                    logger.error("user_management_user_role_delete_no_id", {
                                        filename: get_filename(),
                                        line_number: get_line_number(),
                                        user_id,
                                        role_id,
                                        assignment,
                                    });
                                }
                            }
                            catch (deleteError) {
                                const delete_error_message = deleteError instanceof Error ? deleteError.message : "Unknown error";
                                logger.error("user_management_user_role_delete_failed", {
                                    filename: get_filename(),
                                    line_number: get_line_number(),
                                    user_id,
                                    role_id,
                                    error: delete_error_message,
                                });
                            }
                        }
                    }
                }
            }
        }
        // Invalidate user cache after role assignment changes
        try {
            const config = get_auth_utility_config();
            const cache = get_auth_cache(config.cache_max_users, config.cache_ttl_minutes, config.cache_max_age_minutes);
            cache.invalidate_user(user_id);
        }
        catch (cache_error) {
            const cache_error_message = cache_error instanceof Error ? cache_error.message : "Unknown error";
            logger.warn("user_management_user_roles_cache_invalidation_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id,
                error: cache_error_message,
            });
        }
        logger.info("user_management_user_roles_updated", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id,
            added: to_add.length,
            removed: to_remove.length,
        });
        return NextResponse.json({
            success: true,
            added: to_add.length,
            removed: to_remove.length,
        }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("user_management_user_roles_update_failed", {
            filename: get_filename(),
            line_number: get_line_number(),
            error: error_message,
        });
        return NextResponse.json({ error: "Failed to update user roles" }, { status: 500 });
    }
}
