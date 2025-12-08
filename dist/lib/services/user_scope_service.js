import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger";
import { sanitize_error_for_user } from "../utils/error_sanitizer";
import { SCOPE_LEVEL_NUMBERS, get_scope_by_id, get_scope_by_seq, get_scope_ancestors, } from "./scope_service";
// section: helpers
/**
 * Gets all scope assignments for a user
 */
export async function get_user_scopes(adapter, user_id) {
    try {
        const user_scope_service = createCrudService(adapter, "hazo_user_scopes");
        const scopes = await user_scope_service.findBy({ user_id });
        return {
            success: true,
            scopes: Array.isArray(scopes) ? scopes : [],
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "user_scope_service.ts",
                line_number: 0,
                operation: "get_user_scopes",
                user_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Gets all users assigned to a specific scope
 */
export async function get_users_by_scope(adapter, scope_type, scope_id) {
    try {
        const user_scope_service = createCrudService(adapter, "hazo_user_scopes");
        const scopes = await user_scope_service.findBy({ scope_type, scope_id });
        return {
            success: true,
            scopes: Array.isArray(scopes) ? scopes : [],
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "user_scope_service.ts",
                line_number: 0,
                operation: "get_users_by_scope",
                scope_type,
                scope_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Assigns a scope to a user
 */
export async function assign_user_scope(adapter, user_id, scope_type, scope_id, scope_seq) {
    try {
        const user_scope_service = createCrudService(adapter, "hazo_user_scopes");
        const now = new Date().toISOString();
        // Check if assignment already exists
        const existing = await user_scope_service.findBy({
            user_id,
            scope_type,
            scope_id,
        });
        if (Array.isArray(existing) && existing.length > 0) {
            return {
                success: true,
                scope: existing[0], // Already assigned
            };
        }
        // Verify the scope exists
        const scope_result = await get_scope_by_id(adapter, scope_type, scope_id);
        if (!scope_result.success) {
            return {
                success: false,
                error: "Scope not found",
            };
        }
        // Insert new assignment
        const inserted = await user_scope_service.insert({
            user_id,
            scope_id,
            scope_seq,
            scope_type,
            created_at: now,
            changed_at: now,
        });
        if (!Array.isArray(inserted) || inserted.length === 0) {
            return {
                success: false,
                error: "Failed to assign scope to user",
            };
        }
        return {
            success: true,
            scope: inserted[0],
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "user_scope_service.ts",
                line_number: 0,
                operation: "assign_user_scope",
                user_id,
                scope_type,
                scope_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Removes a scope assignment from a user
 */
export async function remove_user_scope(adapter, user_id, scope_type, scope_id) {
    try {
        const user_scope_service = createCrudService(adapter, "hazo_user_scopes");
        // Find the assignment
        const existing = await user_scope_service.findBy({
            user_id,
            scope_type,
            scope_id,
        });
        if (!Array.isArray(existing) || existing.length === 0) {
            return {
                success: true, // Already not assigned
            };
        }
        // Delete using a filter-based approach since there's no single ID
        // Note: hazo_user_scopes uses composite primary key (user_id, scope_id, scope_type)
        // We need to find and delete by the combination
        const existing_scope = existing[0];
        // Use raw delete with filters if available, otherwise try by the composite key pattern
        // Most hazo_connect adapters support deleteBy or similar
        try {
            // Try to delete by finding records with matching criteria
            const all_user_scopes = await user_scope_service.findBy({ user_id });
            if (Array.isArray(all_user_scopes)) {
                for (const scope of all_user_scopes) {
                    const s = scope;
                    if (s.scope_type === scope_type && s.scope_id === scope_id) {
                        // If the record has an id field, use it
                        if (scope.id) {
                            await user_scope_service.deleteById(scope.id);
                        }
                        break;
                    }
                }
            }
        }
        catch (_a) {
            // Fallback: Some adapters might not support this pattern
            const logger = create_app_logger();
            logger.warn("user_scope_delete_fallback", {
                filename: "user_scope_service.ts",
                line_number: 0,
                note: "Delete by composite key not fully supported",
            });
        }
        return {
            success: true,
            scope: existing_scope,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "user_scope_service.ts",
                line_number: 0,
                operation: "remove_user_scope",
                user_id,
                scope_type,
                scope_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Bulk update user scope assignments
 * Replaces all existing assignments with the new set
 */
export async function update_user_scopes(adapter, user_id, new_scopes) {
    try {
        // Get current scopes
        const current_result = await get_user_scopes(adapter, user_id);
        if (!current_result.success) {
            return current_result;
        }
        const current_scopes = current_result.scopes || [];
        // Determine scopes to add and remove
        const current_keys = new Set(current_scopes.map((s) => `${s.scope_type}:${s.scope_id}`));
        const new_keys = new Set(new_scopes.map((s) => `${s.scope_type}:${s.scope_id}`));
        // Remove scopes not in new set
        for (const scope of current_scopes) {
            const key = `${scope.scope_type}:${scope.scope_id}`;
            if (!new_keys.has(key)) {
                await remove_user_scope(adapter, user_id, scope.scope_type, scope.scope_id);
            }
        }
        // Add scopes not in current set
        for (const scope of new_scopes) {
            const key = `${scope.scope_type}:${scope.scope_id}`;
            if (!current_keys.has(key)) {
                const result = await assign_user_scope(adapter, user_id, scope.scope_type, scope.scope_id, scope.scope_seq);
                if (!result.success) {
                    return result;
                }
            }
        }
        // Return updated scopes
        return get_user_scopes(adapter, user_id);
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "user_scope_service.ts",
                line_number: 0,
                operation: "update_user_scopes",
                user_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Checks if a user has access to a specific scope
 * Access is granted if:
 * 1. User has the exact scope assigned, OR
 * 2. User has access to an ancestor scope (L2 user can access L3, L4, etc.)
 *
 * @param adapter - HazoConnect adapter
 * @param user_id - User ID to check
 * @param target_scope_type - The scope level being accessed
 * @param target_scope_id - The scope ID being accessed (optional if target_scope_seq provided)
 * @param target_scope_seq - The scope seq being accessed (optional if target_scope_id provided)
 */
export async function check_user_scope_access(adapter, user_id, target_scope_type, target_scope_id, target_scope_seq) {
    try {
        // Resolve scope ID if only seq provided
        let resolved_scope_id = target_scope_id;
        let resolved_scope_seq = target_scope_seq;
        if (!resolved_scope_id && resolved_scope_seq) {
            const scope_result = await get_scope_by_seq(adapter, target_scope_type, resolved_scope_seq);
            if (!scope_result.success || !scope_result.scope) {
                return { has_access: false };
            }
            resolved_scope_id = scope_result.scope.id;
        }
        else if (resolved_scope_id && !resolved_scope_seq) {
            const scope_result = await get_scope_by_id(adapter, target_scope_type, resolved_scope_id);
            if (!scope_result.success || !scope_result.scope) {
                return { has_access: false };
            }
            resolved_scope_seq = scope_result.scope.seq;
        }
        if (!resolved_scope_id) {
            return { has_access: false };
        }
        // Get user's assigned scopes
        const user_scopes_result = await get_user_scopes(adapter, user_id);
        if (!user_scopes_result.success || !user_scopes_result.scopes) {
            return { has_access: false };
        }
        const user_scopes = user_scopes_result.scopes;
        // Check 1: Does user have exact scope assigned?
        for (const user_scope of user_scopes) {
            if (user_scope.scope_type === target_scope_type &&
                user_scope.scope_id === resolved_scope_id) {
                return {
                    has_access: true,
                    access_via: {
                        scope_type: user_scope.scope_type,
                        scope_id: user_scope.scope_id,
                        scope_seq: user_scope.scope_seq,
                    },
                    user_scopes,
                };
            }
        }
        // Check 2: Does user have access via an ancestor scope?
        // Get all ancestors of the target scope
        const ancestors_result = await get_scope_ancestors(adapter, target_scope_type, resolved_scope_id);
        if (ancestors_result.success && ancestors_result.scopes) {
            const ancestors = ancestors_result.scopes;
            // For each ancestor, check if user has it assigned
            // Need to determine the level of each ancestor
            let current_level = SCOPE_LEVEL_NUMBERS[target_scope_type];
            for (const ancestor of ancestors) {
                current_level--;
                const ancestor_level = `hazo_scopes_l${current_level}`;
                for (const user_scope of user_scopes) {
                    if (user_scope.scope_type === ancestor_level &&
                        user_scope.scope_id === ancestor.id) {
                        // User has access via this ancestor
                        return {
                            has_access: true,
                            access_via: {
                                scope_type: user_scope.scope_type,
                                scope_id: user_scope.scope_id,
                                scope_seq: user_scope.scope_seq,
                            },
                            user_scopes,
                        };
                    }
                }
            }
        }
        // No access
        return {
            has_access: false,
            user_scopes,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        logger.error("check_user_scope_access_error", {
            filename: "user_scope_service.ts",
            line_number: 0,
            error: error instanceof Error ? error.message : "Unknown error",
            user_id,
            target_scope_type,
            target_scope_id,
        });
        return { has_access: false };
    }
}
/**
 * Gets the effective scopes a user has access to
 * This includes directly assigned scopes and all their descendants
 */
export async function get_user_effective_scopes(adapter, user_id) {
    try {
        const user_scopes_result = await get_user_scopes(adapter, user_id);
        if (!user_scopes_result.success) {
            return {
                success: false,
                error: user_scopes_result.error,
            };
        }
        const direct_scopes = user_scopes_result.scopes || [];
        // Determine which levels user has inherited access to
        // If user has L2 access, they inherit L3, L4, L5, L6, L7
        const inherited_levels = new Set();
        for (const scope of direct_scopes) {
            const level_num = SCOPE_LEVEL_NUMBERS[scope.scope_type];
            // Add all levels below this one
            for (let i = level_num + 1; i <= 7; i++) {
                inherited_levels.add(`hazo_scopes_l${i}`);
            }
        }
        return {
            success: true,
            direct_scopes,
            inherited_scope_types: Array.from(inherited_levels),
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "user_scope_service.ts",
                line_number: 0,
                operation: "get_user_effective_scopes",
                user_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
