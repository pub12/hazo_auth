import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger.js";
import { sanitize_error_for_user } from "../utils/error_sanitizer.js";
import { create_scope } from "./scope_service.js";
import { assign_user_scope } from "./user_scope_service.js";
// section: constants
// Well-known UUID for the default "owner" role (used for firm creators)
// Using a fixed UUID ensures consistency across databases and avoids creation failures
const DEFAULT_OWNER_ROLE_ID = "00000000-0000-0000-0000-000000000100";
const DEFAULT_OWNER_ROLE_NAME = "owner";
// section: helpers
/**
 * Gets or creates the default "owner" role for firm creators
 * Uses a well-known UUID to ensure consistency across databases
 */
export async function ensure_owner_role(adapter) {
    try {
        const role_service = createCrudService(adapter, "hazo_roles");
        // Check if role exists by ID (preferred) or name
        const existing_by_id = await role_service.findBy({
            id: DEFAULT_OWNER_ROLE_ID,
        });
        if (Array.isArray(existing_by_id) && existing_by_id.length > 0) {
            return {
                success: true,
                role_id: DEFAULT_OWNER_ROLE_ID,
            };
        }
        // Also check by name in case it was created with different ID
        const existing_by_name = await role_service.findBy({
            role_name: DEFAULT_OWNER_ROLE_NAME,
        });
        if (Array.isArray(existing_by_name) && existing_by_name.length > 0) {
            return {
                success: true,
                role_id: existing_by_name[0].id,
            };
        }
        // Create the role with the well-known ID
        const now = new Date().toISOString();
        const inserted = await role_service.insert({
            id: DEFAULT_OWNER_ROLE_ID,
            role_name: DEFAULT_OWNER_ROLE_NAME,
            created_at: now,
            changed_at: now,
        });
        if (!Array.isArray(inserted) || inserted.length === 0) {
            return {
                success: false,
                error: "Failed to create owner role",
            };
        }
        // Assign default permissions to owner role
        await assign_owner_permissions(adapter, DEFAULT_OWNER_ROLE_ID);
        return {
            success: true,
            role_id: DEFAULT_OWNER_ROLE_ID,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "firm_service.ts",
                line_number: 0,
                operation: "ensure_owner_role",
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Assigns default permissions to the owner role
 * Includes firm_admin permission for administering the firm
 */
async function assign_owner_permissions(adapter, role_id) {
    try {
        const permission_service = createCrudService(adapter, "hazo_permissions");
        const role_permission_service = createCrudService(adapter, "hazo_role_permissions");
        // Default permissions for firm owner
        // firm_admin is a PERMISSION that grants administrative rights within a firm
        const permission_names = [
            "firm_admin", // Core permission for firm administration
            "admin_user_management",
            "admin_role_management",
            "admin_scope_hierarchy_management",
            "admin_user_scope_assignment",
        ];
        const now = new Date().toISOString();
        for (const perm_name of permission_names) {
            // Find or create permission
            let permissions = await permission_service.findBy({
                permission_name: perm_name,
            });
            let permission_id;
            if (!Array.isArray(permissions) || permissions.length === 0) {
                // Create permission with generated UUID
                const perm_id = crypto.randomUUID();
                const inserted = await permission_service.insert({
                    id: perm_id,
                    permission_name: perm_name,
                    description: `${perm_name} permission`,
                    created_at: now,
                    changed_at: now,
                });
                if (Array.isArray(inserted) && inserted.length > 0) {
                    permission_id = inserted[0].id;
                }
                else {
                    // Use the ID we generated even if insert didn't return it
                    permission_id = perm_id;
                }
            }
            else {
                permission_id = permissions[0].id;
            }
            // Assign permission to role (if not already assigned)
            const existing = await role_permission_service.findBy({
                role_id,
                permission_id,
            });
            if (!Array.isArray(existing) || existing.length === 0) {
                await role_permission_service.insert({
                    role_id,
                    permission_id,
                    created_at: now,
                    changed_at: now,
                });
            }
        }
    }
    catch (error) {
        const logger = create_app_logger();
        logger.warn("assign_owner_permissions_error", {
            filename: "firm_service.ts",
            line_number: 0,
            error: error instanceof Error ? error.message : "Unknown error",
            role_id,
        });
        // Don't throw - this is a best-effort operation
    }
}
/**
 * Creates a new firm (root scope) for a user
 * This is called when a user verifies their email and has no existing scope or invitation
 */
export async function create_firm(adapter, data) {
    try {
        // Get or determine role_id - use the "owner" role for firm creators
        let role_id = data.role_id;
        if (!role_id) {
            const role_result = await ensure_owner_role(adapter);
            if (!role_result.success || !role_result.role_id) {
                return {
                    success: false,
                    error: role_result.error || "Failed to get owner role",
                };
            }
            role_id = role_result.role_id;
        }
        // Create the scope (firm)
        const scope_result = await create_scope(adapter, {
            name: data.firm_name,
            level: data.org_structure, // e.g., "Headquarters"
            parent_id: null, // Root scope - no parent
        });
        if (!scope_result.success || !scope_result.scope) {
            return {
                success: false,
                error: scope_result.error || "Failed to create firm scope",
            };
        }
        // Assign user to the scope with firm_admin role
        const user_scope_result = await assign_user_scope(adapter, {
            user_id: data.user_id,
            scope_id: scope_result.scope.id,
            role_id,
            root_scope_id: scope_result.scope.id, // Self is root since it's a new firm
        });
        if (!user_scope_result.success) {
            // Try to clean up the scope if user assignment fails
            try {
                const scope_service = createCrudService(adapter, "hazo_scopes");
                await scope_service.deleteById(scope_result.scope.id);
            }
            catch (_a) {
                // Ignore cleanup errors
            }
            return {
                success: false,
                error: user_scope_result.error || "Failed to assign user to firm",
            };
        }
        return {
            success: true,
            scope: scope_result.scope,
            user_scope: user_scope_result.scope,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "firm_service.ts",
                line_number: 0,
                operation: "create_firm",
                user_id: data.user_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Gets a role by name
 */
export async function get_role_by_name(adapter, role_name) {
    try {
        const role_service = createCrudService(adapter, "hazo_roles");
        const roles = await role_service.findBy({ role_name });
        if (!Array.isArray(roles) || roles.length === 0) {
            return {
                success: false,
                error: `Role "${role_name}" not found`,
            };
        }
        return {
            success: true,
            role_id: roles[0].id,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "firm_service.ts",
                line_number: 0,
                operation: "get_role_by_name",
                role_name,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
