import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger.js";
import { sanitize_error_for_user } from "../utils/error_sanitizer.js";
// section: constants
/**
 * Super admin scope ID - special UUID for system-level administrators
 * Users assigned to this scope have global access
 */
export const SUPER_ADMIN_SCOPE_ID = "00000000-0000-0000-0000-000000000000";
/**
 * Default system scope ID - for non-multi-tenancy mode
 * All users are assigned to this scope when multi-tenancy is disabled
 */
export const DEFAULT_SYSTEM_SCOPE_ID = "00000000-0000-0000-0000-000000000001";
// section: helpers
/**
 * Normalizes a raw scope record from the database
 */
function normalize_scope_record(raw) {
    return {
        id: raw.id,
        name: raw.name,
        level: raw.level,
        parent_id: raw.parent_id,
        logo_url: raw.logo_url || null,
        primary_color: raw.primary_color || null,
        secondary_color: raw.secondary_color || null,
        tagline: raw.tagline || null,
        created_at: raw.created_at,
        changed_at: raw.changed_at,
    };
}
/**
 * Extracts branding fields from a ScopeRecord into a FirmBranding object
 * Returns null if all branding fields are empty
 */
export function extract_branding(scope) {
    const branding = {};
    if (scope.logo_url)
        branding.logo_url = scope.logo_url;
    if (scope.primary_color)
        branding.primary_color = scope.primary_color;
    if (scope.secondary_color)
        branding.secondary_color = scope.secondary_color;
    if (scope.tagline)
        branding.tagline = scope.tagline;
    return Object.keys(branding).length > 0 ? branding : null;
}
/**
 * Checks if a scope has any branding set
 */
export function has_branding(scope) {
    return !!(scope.logo_url || scope.primary_color || scope.secondary_color || scope.tagline);
}
/**
 * Checks if the given scope_id is the super admin scope
 */
export function is_super_admin_scope(scope_id) {
    return scope_id === SUPER_ADMIN_SCOPE_ID;
}
/**
 * Checks if the given scope_id is the default system scope
 */
export function is_default_system_scope(scope_id) {
    return scope_id === DEFAULT_SYSTEM_SCOPE_ID;
}
/**
 * Checks if the given scope_id is a system scope (super admin or default system)
 */
export function is_system_scope(scope_id) {
    return is_super_admin_scope(scope_id) || is_default_system_scope(scope_id);
}
// section: crud operations
/**
 * Gets all scopes, optionally filtered by parent_id
 */
export async function get_all_scopes(adapter, parent_id) {
    try {
        const scope_service = createCrudService(adapter, "hazo_scopes");
        let scopes;
        if (parent_id !== undefined) {
            scopes = await scope_service.findBy({ parent_id });
        }
        else {
            scopes = await scope_service.findBy({});
        }
        if (!Array.isArray(scopes)) {
            return {
                success: true,
                scopes: [],
            };
        }
        return {
            success: true,
            scopes: scopes.map((s) => normalize_scope_record(s)),
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "get_all_scopes",
                parent_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Gets root scopes (scopes with no parent)
 */
export async function get_root_scopes(adapter) {
    return get_all_scopes(adapter, null);
}
/**
 * Gets a single scope by ID
 */
export async function get_scope_by_id(adapter, scope_id) {
    try {
        const scope_service = createCrudService(adapter, "hazo_scopes");
        const scopes = await scope_service.findBy({ id: scope_id });
        if (!Array.isArray(scopes) || scopes.length === 0) {
            return {
                success: false,
                error: "Scope not found",
            };
        }
        return {
            success: true,
            scope: normalize_scope_record(scopes[0]),
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "get_scope_by_id",
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
 * Gets a single scope by name (case-insensitive partial match not supported - exact match)
 */
export async function get_scope_by_name(adapter, name) {
    try {
        const scope_service = createCrudService(adapter, "hazo_scopes");
        const scopes = await scope_service.findBy({ name });
        if (!Array.isArray(scopes) || scopes.length === 0) {
            return {
                success: false,
                error: "Scope not found",
            };
        }
        return {
            success: true,
            scope: normalize_scope_record(scopes[0]),
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "get_scope_by_name",
                name,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Creates a new scope
 */
export async function create_scope(adapter, data) {
    try {
        const scope_service = createCrudService(adapter, "hazo_scopes");
        const now = new Date().toISOString();
        // Validate parent exists if provided
        if (data.parent_id) {
            const parent_result = await get_scope_by_id(adapter, data.parent_id);
            if (!parent_result.success) {
                return {
                    success: false,
                    error: "Parent scope not found",
                };
            }
        }
        const insert_data = {
            name: data.name,
            level: data.level,
            parent_id: data.parent_id || null,
            logo_url: data.logo_url || null,
            primary_color: data.primary_color || null,
            secondary_color: data.secondary_color || null,
            tagline: data.tagline || null,
            created_at: now,
            changed_at: now,
        };
        const inserted = await scope_service.insert(insert_data);
        if (!Array.isArray(inserted) || inserted.length === 0) {
            return {
                success: false,
                error: "Failed to create scope",
            };
        }
        return {
            success: true,
            scope: normalize_scope_record(inserted[0]),
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "create_scope",
                data,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Updates an existing scope
 */
export async function update_scope(adapter, scope_id, data) {
    var _a;
    try {
        // Prevent updating system scopes
        if (is_system_scope(scope_id)) {
            return {
                success: false,
                error: "Cannot modify system scopes",
            };
        }
        const scope_service = createCrudService(adapter, "hazo_scopes");
        const now = new Date().toISOString();
        // Check scope exists
        const existing = await get_scope_by_id(adapter, scope_id);
        if (!existing.success) {
            return existing;
        }
        // Validate parent if being changed
        if (data.parent_id !== undefined && data.parent_id !== null) {
            // Prevent circular reference
            if (data.parent_id === scope_id) {
                return {
                    success: false,
                    error: "Cannot set scope as its own parent",
                };
            }
            const parent_result = await get_scope_by_id(adapter, data.parent_id);
            if (!parent_result.success) {
                return {
                    success: false,
                    error: "Parent scope not found",
                };
            }
            // Check if new parent is a descendant of this scope (would create cycle)
            const descendants = await get_scope_descendants(adapter, scope_id);
            if (descendants.success &&
                ((_a = descendants.scopes) === null || _a === void 0 ? void 0 : _a.some((s) => s.id === data.parent_id))) {
                return {
                    success: false,
                    error: "Cannot set a descendant as parent (would create cycle)",
                };
            }
        }
        const update_data = {
            changed_at: now,
        };
        if (data.name !== undefined) {
            update_data.name = data.name;
        }
        if (data.level !== undefined) {
            update_data.level = data.level;
        }
        if (data.parent_id !== undefined) {
            update_data.parent_id = data.parent_id;
        }
        // Handle branding fields individually
        if (data.logo_url !== undefined) {
            update_data.logo_url = data.logo_url;
        }
        if (data.primary_color !== undefined) {
            update_data.primary_color = data.primary_color;
        }
        if (data.secondary_color !== undefined) {
            update_data.secondary_color = data.secondary_color;
        }
        if (data.tagline !== undefined) {
            update_data.tagline = data.tagline;
        }
        const updated = await scope_service.updateById(scope_id, update_data);
        if (!Array.isArray(updated) || updated.length === 0) {
            return {
                success: false,
                error: "Failed to update scope",
            };
        }
        return {
            success: true,
            scope: normalize_scope_record(updated[0]),
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "update_scope",
                scope_id,
                data,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Deletes a scope (cascades to children via database FK constraints)
 */
export async function delete_scope(adapter, scope_id) {
    try {
        // Prevent deleting system scopes
        if (is_system_scope(scope_id)) {
            return {
                success: false,
                error: "Cannot delete system scopes",
            };
        }
        const scope_service = createCrudService(adapter, "hazo_scopes");
        // Check scope exists
        const existing = await get_scope_by_id(adapter, scope_id);
        if (!existing.success) {
            return existing;
        }
        await scope_service.deleteById(scope_id);
        return {
            success: true,
            scope: existing.scope,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "delete_scope",
                scope_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
// section: hierarchy operations
/**
 * Gets immediate children of a scope
 */
export async function get_scope_children(adapter, scope_id) {
    try {
        const scope_service = createCrudService(adapter, "hazo_scopes");
        const children = await scope_service.findBy({ parent_id: scope_id });
        return {
            success: true,
            scopes: Array.isArray(children)
                ? children.map((c) => normalize_scope_record(c))
                : [],
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "get_scope_children",
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
 * Gets all ancestors of a scope up to root
 * Returns array ordered from immediate parent to root
 */
export async function get_scope_ancestors(adapter, scope_id) {
    try {
        const ancestors = [];
        // Get the scope first
        const scope_result = await get_scope_by_id(adapter, scope_id);
        if (!scope_result.success || !scope_result.scope) {
            return scope_result;
        }
        let current_scope = scope_result.scope;
        // Walk up the hierarchy following parent_id
        while (current_scope.parent_id) {
            const parent_result = await get_scope_by_id(adapter, current_scope.parent_id);
            if (!parent_result.success || !parent_result.scope)
                break;
            ancestors.push(parent_result.scope);
            current_scope = parent_result.scope;
        }
        return {
            success: true,
            scopes: ancestors,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "get_scope_ancestors",
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
 * Gets all descendants of a scope (all levels below)
 * Returns flat array of all descendant scopes
 */
export async function get_scope_descendants(adapter, scope_id) {
    try {
        const descendants = [];
        // Recursive function to collect all descendants
        async function collect_descendants(current_id) {
            const children_result = await get_scope_children(adapter, current_id);
            if (children_result.success && children_result.scopes) {
                for (const child of children_result.scopes) {
                    descendants.push(child);
                    await collect_descendants(child.id);
                }
            }
        }
        await collect_descendants(scope_id);
        return {
            success: true,
            scopes: descendants,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "get_scope_descendants",
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
 * Gets the root scope ID for a given scope (follows parent_id to root)
 */
export async function get_root_scope_id(adapter, scope_id) {
    var _a;
    try {
        const scope_result = await get_scope_by_id(adapter, scope_id);
        if (!scope_result.success || !scope_result.scope) {
            return null;
        }
        // If no parent, this is the root
        if (!scope_result.scope.parent_id) {
            return scope_id;
        }
        // Get ancestors and return the last one (root)
        const ancestors_result = await get_scope_ancestors(adapter, scope_id);
        if (!ancestors_result.success || !((_a = ancestors_result.scopes) === null || _a === void 0 ? void 0 : _a.length)) {
            return scope_id; // Fallback to self
        }
        // Last ancestor is the root
        return ancestors_result.scopes[ancestors_result.scopes.length - 1].id;
    }
    catch (_b) {
        return null;
    }
}
/**
 * Gets scope hierarchy tree starting from root scopes or a specific scope
 */
export async function get_scope_tree(adapter, root_scope_id) {
    try {
        // Build tree recursively
        async function build_tree(scope) {
            const node = Object.assign(Object.assign({}, scope), { children: [] });
            const children_result = await get_scope_children(adapter, scope.id);
            if (children_result.success && children_result.scopes) {
                for (const child of children_result.scopes) {
                    const child_node = await build_tree(child);
                    node.children.push(child_node);
                }
            }
            return node;
        }
        // If specific root provided, start from there
        if (root_scope_id) {
            const root_result = await get_scope_by_id(adapter, root_scope_id);
            if (!root_result.success || !root_result.scope) {
                return { success: false, error: "Root scope not found" };
            }
            const tree_node = await build_tree(root_result.scope);
            return { success: true, tree: [tree_node] };
        }
        // Otherwise get all root scopes and build trees
        const roots_result = await get_root_scopes(adapter);
        if (!roots_result.success || !roots_result.scopes) {
            return { success: true, tree: [] };
        }
        // Exclude system scopes from tree view unless specifically requested
        const non_system_roots = roots_result.scopes.filter((s) => !is_system_scope(s.id));
        const tree = [];
        for (const root_scope of non_system_roots) {
            const node = await build_tree(root_scope);
            tree.push(node);
        }
        return { success: true, tree };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "get_scope_tree",
                root_scope_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Ensures the super admin scope exists
 */
export async function ensure_super_admin_scope(adapter) {
    try {
        // Check if already exists
        const existing = await get_scope_by_id(adapter, SUPER_ADMIN_SCOPE_ID);
        if (existing.success && existing.scope) {
            return existing;
        }
        // Create it
        const scope_service = createCrudService(adapter, "hazo_scopes");
        const now = new Date().toISOString();
        const inserted = await scope_service.insert({
            id: SUPER_ADMIN_SCOPE_ID,
            name: "Super Admin",
            level: "system",
            parent_id: null,
            logo_url: null,
            primary_color: null,
            secondary_color: null,
            tagline: null,
            created_at: now,
            changed_at: now,
        });
        if (!Array.isArray(inserted) || inserted.length === 0) {
            return {
                success: false,
                error: "Failed to create super admin scope",
            };
        }
        return {
            success: true,
            scope: normalize_scope_record(inserted[0]),
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "ensure_super_admin_scope",
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Ensures the default system scope exists
 */
export async function ensure_default_system_scope(adapter) {
    try {
        // Check if already exists
        const existing = await get_scope_by_id(adapter, DEFAULT_SYSTEM_SCOPE_ID);
        if (existing.success && existing.scope) {
            return existing;
        }
        // Create it
        const scope_service = createCrudService(adapter, "hazo_scopes");
        const now = new Date().toISOString();
        const inserted = await scope_service.insert({
            id: DEFAULT_SYSTEM_SCOPE_ID,
            name: "System",
            level: "default",
            parent_id: null,
            logo_url: null,
            primary_color: null,
            secondary_color: null,
            tagline: null,
            created_at: now,
            changed_at: now,
        });
        if (!Array.isArray(inserted) || inserted.length === 0) {
            return {
                success: false,
                error: "Failed to create default system scope",
            };
        }
        return {
            success: true,
            scope: normalize_scope_record(inserted[0]),
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "scope_service.ts",
                line_number: 0,
                operation: "ensure_default_system_scope",
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
