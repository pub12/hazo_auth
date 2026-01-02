// file_description: API route handler for managing user roles (v5.x: via hazo_user_scopes)
// v5.x Migration Note: Roles are now assigned per-scope via hazo_user_scopes table.
// This endpoint provides backward compatibility by operating on scope-based role assignments.
// For new implementations, consider using scope-based role assignment endpoints directly.
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../lib/hazo_connect_instance.server.js";
import { createCrudService, getSqliteAdminService } from "hazo_connect/server";
import { create_app_logger } from "../../lib/app_logger.js";
import { get_filename, get_line_number } from "../../lib/utils/api_route_helpers.js";
import { get_auth_cache } from "../../lib/auth/auth_cache.js";
import { get_auth_utility_config } from "../../lib/auth_utility_config.server.js";
import { DEFAULT_SYSTEM_SCOPE_ID } from "../../lib/services/scope_service.js";
// section: route_config
export const dynamic = 'force-dynamic';
// section: constants
/**
 * CRUD service options for hazo_user_scopes table
 * This table uses a composite primary key (user_id, scope_id) and no 'id' column
 */
const USER_SCOPES_CRUD_OPTIONS = {
    primaryKeys: ["user_id", "scope_id"],
    autoId: false,
};
// section: api_handler
/**
 * GET - Get roles assigned to a user
 * v5.x: Returns unique role_ids from hazo_user_scopes (aggregated across all scopes)
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
        // v5.x: Use hazo_user_scopes instead of hazo_user_roles
        const user_scopes_service = createCrudService(hazoConnect, "hazo_user_scopes", USER_SCOPES_CRUD_OPTIONS);
        // Get all scope assignments for this user
        const user_scopes = await user_scopes_service.findBy({
            user_id,
        });
        if (!Array.isArray(user_scopes)) {
            return NextResponse.json({ error: "Failed to fetch user roles" }, { status: 500 });
        }
        // Extract unique role IDs (v5.x: role_id is string UUID)
        const role_ids_set = new Set();
        for (const us of user_scopes) {
            const role_id = us.role_id;
            if (role_id) {
                role_ids_set.add(role_id);
            }
        }
        const role_ids = Array.from(role_ids_set);
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
 * POST - Assign a role to a user within a scope
 * v5.x: Roles are assigned per-scope via hazo_user_scopes
 * Body: { user_id: string, role_id: string, scope_id?: string }
 * If scope_id is not provided, uses DEFAULT_SYSTEM_SCOPE_ID
 */
export async function POST(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { user_id, role_id, scope_id: provided_scope_id } = body;
        if (!user_id || typeof user_id !== "string") {
            return NextResponse.json({ error: "user_id is required and must be a string" }, { status: 400 });
        }
        // v5.x: role_id is string UUID (accept both string and number for backward compatibility)
        const role_id_str = String(role_id);
        if (!role_id_str) {
            return NextResponse.json({ error: "role_id is required" }, { status: 400 });
        }
        // Use provided scope_id or default to system scope
        const scope_id = provided_scope_id || DEFAULT_SYSTEM_SCOPE_ID;
        const hazoConnect = get_hazo_connect_instance();
        const user_scopes_service = createCrudService(hazoConnect, "hazo_user_scopes", USER_SCOPES_CRUD_OPTIONS);
        // Check if user exists
        const users_service = createCrudService(hazoConnect, "hazo_users");
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Check if role exists
        const roles_service = createCrudService(hazoConnect, "hazo_roles");
        const roles = await roles_service.findBy({ id: role_id_str });
        if (!Array.isArray(roles) || roles.length === 0) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }
        // Check if scope-role assignment already exists for this user
        const existing_assignments = await user_scopes_service.findBy({
            user_id,
            scope_id,
        });
        if (Array.isArray(existing_assignments) && existing_assignments.length > 0) {
            // Update the role for existing scope assignment
            const existing = existing_assignments[0];
            if (existing.role_id === role_id_str) {
                return NextResponse.json({ error: "Role is already assigned to this user in this scope" }, { status: 409 });
            }
            // Update role_id for existing scope assignment
            // Note: Composite key tables don't support simple update, need to delete and re-insert
            // For now, return conflict - user should use PUT for updates
            return NextResponse.json({ error: "User already has a role in this scope. Use PUT to update." }, { status: 409 });
        }
        // Assign role to user in scope
        const now = new Date().toISOString();
        await user_scopes_service.insert({
            user_id,
            scope_id,
            root_scope_id: scope_id, // For new assignments, scope is its own root
            role_id: role_id_str,
            created_at: now,
            changed_at: now,
        });
        logger.info("user_management_user_role_assigned", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id,
            role_id: role_id_str,
            scope_id,
        });
        return NextResponse.json({
            success: true,
            assignment: {
                user_id,
                role_id: role_id_str,
                scope_id,
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
 * v5.x: This updates roles across all of user's scope assignments.
 * For fine-grained control, use scope-specific endpoints.
 * Body: { user_id: string, role_ids: string[], scope_id?: string }
 * If scope_id is provided, only updates that scope. Otherwise updates default system scope.
 */
export async function PUT(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { user_id, role_ids, scope_id: provided_scope_id } = body;
        if (!user_id || typeof user_id !== "string") {
            return NextResponse.json({ error: "user_id is required and must be a string" }, { status: 400 });
        }
        if (!Array.isArray(role_ids)) {
            return NextResponse.json({ error: "role_ids is required and must be an array" }, { status: 400 });
        }
        // Use provided scope_id or default to system scope
        const scope_id = provided_scope_id || DEFAULT_SYSTEM_SCOPE_ID;
        const hazoConnect = get_hazo_connect_instance();
        const user_scopes_service = createCrudService(hazoConnect, "hazo_user_scopes", USER_SCOPES_CRUD_OPTIONS);
        // Check if user exists
        const users_service = createCrudService(hazoConnect, "hazo_users");
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Get current user scope assignments
        const current_user_scopes = await user_scopes_service.findBy({
            user_id,
        });
        if (!Array.isArray(current_user_scopes)) {
            return NextResponse.json({ error: "Failed to fetch current user scopes" }, { status: 500 });
        }
        // v5.x: role_ids are strings (convert any numbers for backward compatibility)
        const target_role_ids = role_ids.map((id) => String(id));
        // Get current role_ids (unique across all scopes)
        const current_role_ids_set = new Set();
        for (const us of current_user_scopes) {
            const role_id = us.role_id;
            if (role_id) {
                current_role_ids_set.add(role_id);
            }
        }
        const current_role_ids = Array.from(current_role_ids_set);
        // Find roles to add and remove
        const to_add = target_role_ids.filter((id) => !current_role_ids.includes(id));
        const to_remove = current_role_ids.filter((id) => !target_role_ids.includes(id));
        const now = new Date().toISOString();
        const roles_service = createCrudService(hazoConnect, "hazo_roles");
        // Add new roles (assign to the specified/default scope)
        for (const role_id of to_add) {
            // Check if role exists
            const roles = await roles_service.findBy({ id: role_id });
            if (Array.isArray(roles) && roles.length > 0) {
                // Check if scope assignment already exists
                const existing = await user_scopes_service.findBy({
                    user_id,
                    scope_id,
                });
                if (!Array.isArray(existing) || existing.length === 0) {
                    await user_scopes_service.insert({
                        user_id,
                        scope_id,
                        root_scope_id: scope_id,
                        role_id,
                        created_at: now,
                        changed_at: now,
                    });
                }
            }
        }
        // Remove roles (remove scope assignments that have these roles)
        if (to_remove.length > 0) {
            try {
                const admin_service = getSqliteAdminService();
                for (const role_id of to_remove) {
                    // Find scope assignments with this role
                    const scope_assignments = current_user_scopes.filter((us) => us.role_id === role_id);
                    for (const assignment of scope_assignments) {
                        await admin_service.deleteRows("hazo_user_scopes", {
                            user_id,
                            scope_id: assignment.scope_id,
                        });
                    }
                }
            }
            catch (adminError) {
                const error_message = adminError instanceof Error ? adminError.message : "Unknown error";
                logger.warn("user_management_user_scope_delete_admin_failed", {
                    filename: get_filename(),
                    line_number: get_line_number(),
                    error: error_message,
                    note: "Delete via admin service failed",
                });
                // Note: Composite key deletion is complex; log the issue but continue
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
