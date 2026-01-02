// file_description: API route handler for roles management operations (list, create, update permissions)
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
 * GET - Fetch all roles with their permissions
 */
export async function GET(request) {
    const logger = create_app_logger();
    try {
        const hazoConnect = get_hazo_connect_instance();
        const roles_service = createCrudService(hazoConnect, "hazo_roles");
        const permissions_service = createCrudService(hazoConnect, "hazo_permissions");
        const role_permissions_service = createCrudService(hazoConnect, "hazo_role_permissions");
        // Fetch all roles (empty object means no filter - get all records)
        const roles = await roles_service.findBy({});
        const permissions = await permissions_service.findBy({});
        const role_permissions = await role_permissions_service.findBy({});
        if (!Array.isArray(roles) || !Array.isArray(permissions) || !Array.isArray(role_permissions)) {
            return NextResponse.json({ error: "Failed to fetch roles data" }, { status: 500 });
        }
        // Build role-permission mapping
        const role_permission_map = {};
        role_permissions.forEach((rp) => {
            const role_id = rp.role_id;
            const permission_id = rp.permission_id;
            if (!role_permission_map[role_id]) {
                role_permission_map[role_id] = [];
            }
            role_permission_map[role_id].push(permission_id);
        });
        // Build permission name map
        const permission_name_map = {};
        permissions.forEach((perm) => {
            permission_name_map[perm.id] = perm.permission_name;
        });
        // Format response
        const roles_with_permissions = roles.map((role) => {
            const role_id = role.id;
            const permission_ids = role_permission_map[role_id] || [];
            const permission_names = permission_ids.map((pid) => permission_name_map[pid]).filter(Boolean);
            return {
                role_id: role.id,
                role_name: role.role_name,
                permissions: permission_names,
            };
        });
        logger.info("user_management_roles_fetched", {
            filename: get_filename(),
            line_number: get_line_number(),
            role_count: roles.length,
            permission_count: permissions.length,
        });
        return NextResponse.json({
            success: true,
            roles: roles_with_permissions,
            permissions: permissions.map((p) => ({
                id: p.id,
                permission_name: p.permission_name,
            })),
        }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("user_management_roles_fetch_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }
}
/**
 * POST - Create new role
 */
export async function POST(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { role_name } = body;
        if (!role_name || typeof role_name !== "string" || role_name.trim().length === 0) {
            return NextResponse.json({ error: "role_name is required and must be a non-empty string" }, { status: 400 });
        }
        const hazoConnect = get_hazo_connect_instance();
        const roles_service = createCrudService(hazoConnect, "hazo_roles");
        // Check if role already exists
        const existing_roles = await roles_service.findBy({
            role_name: role_name.trim(),
        });
        if (Array.isArray(existing_roles) && existing_roles.length > 0) {
            return NextResponse.json({ error: "Role with this name already exists" }, { status: 409 });
        }
        // Create new role
        const now = new Date().toISOString();
        const new_role_result = await roles_service.insert({
            role_name: role_name.trim(),
            created_at: now,
            changed_at: now,
        });
        // insert() returns an array, get the first element
        if (!Array.isArray(new_role_result) || new_role_result.length === 0) {
            return NextResponse.json({ error: "Failed to create role - no record returned" }, { status: 500 });
        }
        const new_role = new_role_result[0];
        logger.info("user_management_role_created", {
            filename: get_filename(),
            line_number: get_line_number(),
            role_id: new_role.id,
            role_name: role_name.trim(),
        });
        return NextResponse.json({
            success: true,
            role: {
                role_id: new_role.id,
                role_name: role_name.trim(),
            },
        }, { status: 201 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("user_management_role_create_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
    }
}
/**
 * PUT - Update role permissions (save role-permission matrix)
 */
export async function PUT(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { roles } = body;
        if (!Array.isArray(roles)) {
            return NextResponse.json({ error: "roles array is required" }, { status: 400 });
        }
        const hazoConnect = get_hazo_connect_instance();
        const roles_service = createCrudService(hazoConnect, "hazo_roles");
        const permissions_service = createCrudService(hazoConnect, "hazo_permissions");
        const role_permissions_service = createCrudService(hazoConnect, "hazo_role_permissions");
        // Get all permissions to build name-to-id map (empty object means no filter - get all records)
        const all_permissions = await permissions_service.findBy({});
        if (!Array.isArray(all_permissions)) {
            return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
        }
        const permission_name_to_id = {};
        all_permissions.forEach((perm) => {
            permission_name_to_id[perm.permission_name] = perm.id;
        });
        const now = new Date().toISOString();
        const modified_role_ids = []; // Track all role IDs that were modified
        // Process each role
        for (const role_data of roles) {
            const { role_id, role_name, permissions } = role_data;
            if (!role_name || !Array.isArray(permissions)) {
                continue; // Skip invalid entries
            }
            let current_role_id;
            if (role_id) {
                // Update existing role
                current_role_id = role_id;
                await roles_service.updateById(role_id, {
                    role_name: role_name.trim(),
                    changed_at: now,
                });
            }
            else {
                // Create new role
                const existing_roles = await roles_service.findBy({
                    role_name: role_name.trim(),
                });
                if (Array.isArray(existing_roles) && existing_roles.length > 0) {
                    current_role_id = existing_roles[0].id;
                }
                else {
                    const new_role = await roles_service.insert({
                        role_name: role_name.trim(),
                        created_at: now,
                        changed_at: now,
                    });
                    // Handle both single object and array responses from insert
                    if (Array.isArray(new_role) && new_role.length > 0) {
                        current_role_id = new_role[0].id;
                    }
                    else if (!Array.isArray(new_role) && new_role.id !== undefined) {
                        current_role_id = new_role.id;
                    }
                    else {
                        // If insert didn't return an id, try to find the role by name
                        const inserted_roles = await roles_service.findBy({
                            role_name: role_name.trim(),
                        });
                        if (Array.isArray(inserted_roles) && inserted_roles.length > 0) {
                            current_role_id = inserted_roles[0].id;
                        }
                    }
                }
            }
            // Skip if we couldn't determine the role ID
            if (!current_role_id) {
                logger.warn("user_management_role_id_not_found", {
                    filename: get_filename(),
                    line_number: get_line_number(),
                    role_name: role_name.trim(),
                    role_id,
                });
                continue;
            }
            // Track this role ID for cache invalidation
            modified_role_ids.push(current_role_id);
            // Get current role-permission mappings
            const current_mappings = await role_permissions_service.findBy({
                role_id: current_role_id,
            });
            const current_permission_ids = Array.isArray(current_mappings)
                ? current_mappings.map((m) => m.permission_id)
                : [];
            // Get target permission IDs
            const target_permission_ids = permissions
                .map((perm_name) => permission_name_to_id[perm_name])
                .filter((id) => id !== undefined);
            // Delete removed permissions
            const to_delete = current_permission_ids.filter((id) => !target_permission_ids.includes(id));
            if (to_delete.length > 0) {
                try {
                    const admin_service = getSqliteAdminService();
                    for (const perm_id of to_delete) {
                        await admin_service.deleteRows("hazo_role_permissions", {
                            role_id: current_role_id,
                            permission_id: perm_id,
                        });
                    }
                }
                catch (adminError) {
                    const error_message = adminError instanceof Error ? adminError.message : "Unknown error";
                    logger.warn("user_management_role_permission_delete_admin_failed", {
                        filename: get_filename(),
                        line_number: get_line_number(),
                        error: error_message,
                        note: "Trying fallback method",
                    });
                    // Fallback
                    for (const perm_id of to_delete) {
                        const mappings_to_delete = await role_permissions_service.findBy({
                            role_id: current_role_id,
                            permission_id: perm_id,
                        });
                        if (Array.isArray(mappings_to_delete) && mappings_to_delete.length > 0) {
                            for (const mapping of mappings_to_delete) {
                                try {
                                    if (mapping.id !== undefined) {
                                        await role_permissions_service.deleteById(mapping.id);
                                    }
                                    else if (mapping.rowid !== undefined) {
                                        await role_permissions_service.deleteById(mapping.rowid);
                                    }
                                    else {
                                        logger.error("user_management_role_permission_delete_no_id", {
                                            filename: get_filename(),
                                            line_number: get_line_number(),
                                            role_id: current_role_id,
                                            permission_id: perm_id,
                                            mapping,
                                        });
                                    }
                                }
                                catch (deleteError) {
                                    const delete_error_message = deleteError instanceof Error ? deleteError.message : "Unknown error";
                                    logger.error("user_management_role_permission_delete_failed", {
                                        filename: get_filename(),
                                        line_number: get_line_number(),
                                        role_id: current_role_id,
                                        permission_id: perm_id,
                                        error: delete_error_message,
                                    });
                                }
                            }
                        }
                    }
                }
            }
            // Add new permissions
            const to_add = target_permission_ids.filter((id) => !current_permission_ids.includes(id));
            for (const perm_id of to_add) {
                await role_permissions_service.insert({
                    role_id: current_role_id,
                    permission_id: perm_id,
                    created_at: now,
                    changed_at: now,
                });
            }
        }
        // Invalidate cache for all affected roles
        try {
            const config = get_auth_utility_config();
            const cache = get_auth_cache(config.cache_max_users, config.cache_ttl_minutes, config.cache_max_age_minutes);
            if (modified_role_ids.length > 0) {
                cache.invalidate_by_roles(modified_role_ids);
            }
        }
        catch (cache_error) {
            const cache_error_message = cache_error instanceof Error ? cache_error.message : "Unknown error";
            logger.warn("user_management_roles_cache_invalidation_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                error: cache_error_message,
            });
        }
        logger.info("user_management_roles_updated", {
            filename: get_filename(),
            line_number: get_line_number(),
            role_count: roles.length,
        });
        return NextResponse.json({ success: true }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("user_management_roles_update_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to update roles" }, { status: 500 });
    }
}
