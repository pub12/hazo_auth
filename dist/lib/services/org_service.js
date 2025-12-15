import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger";
import { sanitize_error_for_user } from "../utils/error_sanitizer";
// section: constants
const TABLE_NAME = "hazo_org";
const USERS_TABLE_NAME = "hazo_users";
// section: helpers
/**
 * Gets the user count for an organization
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @returns User count
 */
export async function get_org_user_count(adapter, org_id) {
    try {
        const users_service = createCrudService(adapter, USERS_TABLE_NAME);
        const users = await users_service.findBy({ org_id });
        const count = Array.isArray(users) ? users.length : 0;
        return {
            success: true,
            count,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "get_org_user_count",
                org_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Gets user count for the root organization (includes all child orgs)
 * @param adapter - HazoConnect adapter
 * @param root_org_id - Root organization ID
 * @returns Total user count across org tree
 */
export async function get_root_org_user_count(adapter, root_org_id) {
    try {
        const users_service = createCrudService(adapter, USERS_TABLE_NAME);
        const users = await users_service.findBy({ root_org_id });
        const count = Array.isArray(users) ? users.length : 0;
        return {
            success: true,
            count,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "get_root_org_user_count",
                root_org_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
// section: service_functions
/**
 * Gets all organizations, optionally filtered by root_org_id
 * @param adapter - HazoConnect adapter
 * @param options - Filter options
 * @returns List of organizations
 */
export async function get_orgs(adapter, options) {
    try {
        const org_service = createCrudService(adapter, TABLE_NAME);
        let orgs;
        if (options === null || options === void 0 ? void 0 : options.root_org_id) {
            // Get orgs in this org tree (by root_org_id)
            orgs = await org_service.findBy({ root_org_id: options.root_org_id });
            // Also include the root org itself
            const root_orgs = await org_service.findBy({ id: options.root_org_id });
            if (Array.isArray(root_orgs) && root_orgs.length > 0) {
                orgs = [...root_orgs, ...(Array.isArray(orgs) ? orgs : [])];
            }
        }
        else {
            // Get all orgs (global admin view)
            orgs = await org_service.findBy({});
        }
        if (!Array.isArray(orgs)) {
            return {
                success: true,
                orgs: [],
            };
        }
        // Filter inactive if not requested
        let filtered_orgs = orgs;
        if (!(options === null || options === void 0 ? void 0 : options.include_inactive)) {
            filtered_orgs = filtered_orgs.filter((org) => org.active !== false);
        }
        return {
            success: true,
            orgs: filtered_orgs,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "get_orgs",
                options,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Gets a single organization by ID with computed user count
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @returns Organization with user count
 */
export async function get_org_by_id(adapter, org_id) {
    try {
        const org_service = createCrudService(adapter, TABLE_NAME);
        const orgs = await org_service.findBy({ id: org_id });
        if (!Array.isArray(orgs) || orgs.length === 0) {
            return {
                success: false,
                error: "Organization not found",
            };
        }
        const org = orgs[0];
        // Get user count
        const count_result = await get_org_user_count(adapter, org_id);
        const current_user_count = count_result.success ? count_result.count : 0;
        return {
            success: true,
            org: Object.assign(Object.assign({}, org), { current_user_count }),
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "get_org_by_id",
                org_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Creates a new organization
 * @param adapter - HazoConnect adapter
 * @param data - Organization data
 * @returns Created organization
 */
export async function create_org(adapter, data) {
    var _a;
    try {
        const org_service = createCrudService(adapter, TABLE_NAME);
        const now = new Date().toISOString();
        // Determine root_org_id
        let root_org_id = null;
        if (data.parent_org_id) {
            // Validate parent exists
            const parent_result = await get_org_by_id(adapter, data.parent_org_id);
            if (!parent_result.success || !parent_result.org) {
                return {
                    success: false,
                    error: "Parent organization not found",
                };
            }
            // If parent has a root_org_id, use it; otherwise parent IS the root
            root_org_id = parent_result.org.root_org_id || data.parent_org_id;
        }
        const insert_data = {
            name: data.name,
            user_limit: (_a = data.user_limit) !== null && _a !== void 0 ? _a : 0,
            parent_org_id: data.parent_org_id || null,
            root_org_id: root_org_id,
            active: true,
            created_at: now,
            created_by: data.created_by,
            changed_at: now,
            changed_by: data.created_by,
        };
        const inserted = await org_service.insert(insert_data);
        if (!Array.isArray(inserted) || inserted.length === 0) {
            return {
                success: false,
                error: "Failed to create organization",
            };
        }
        return {
            success: true,
            org: inserted[0],
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "create_org",
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
 * Updates an existing organization
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @param data - Update data
 * @returns Updated organization
 */
export async function update_org(adapter, org_id, data) {
    try {
        const org_service = createCrudService(adapter, TABLE_NAME);
        const now = new Date().toISOString();
        // Check org exists
        const existing = await get_org_by_id(adapter, org_id);
        if (!existing.success) {
            return {
                success: false,
                error: existing.error || "Organization not found",
            };
        }
        const update_data = {
            changed_at: now,
            changed_by: data.changed_by,
        };
        if (data.name !== undefined) {
            update_data.name = data.name;
        }
        if (data.user_limit !== undefined) {
            update_data.user_limit = data.user_limit;
        }
        const updated = await org_service.updateById(org_id, update_data);
        if (!Array.isArray(updated) || updated.length === 0) {
            return {
                success: false,
                error: "Failed to update organization",
            };
        }
        return {
            success: true,
            org: updated[0],
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "update_org",
                org_id,
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
 * Soft deletes an organization (sets active = false)
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @param changed_by - User ID making the change
 * @returns Deactivated organization
 */
export async function soft_delete_org(adapter, org_id, changed_by) {
    try {
        const org_service = createCrudService(adapter, TABLE_NAME);
        const now = new Date().toISOString();
        // Check org exists
        const existing = await get_org_by_id(adapter, org_id);
        if (!existing.success) {
            return {
                success: false,
                error: existing.error || "Organization not found",
            };
        }
        const update_data = {
            active: false,
            changed_at: now,
            changed_by: changed_by,
        };
        const updated = await org_service.updateById(org_id, update_data);
        if (!Array.isArray(updated) || updated.length === 0) {
            return {
                success: false,
                error: "Failed to deactivate organization",
            };
        }
        return {
            success: true,
            org: updated[0],
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "soft_delete_org",
                org_id,
                changed_by,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Gets immediate children of an organization
 * @param adapter - HazoConnect adapter
 * @param org_id - Parent organization ID
 * @returns Child organizations
 */
export async function get_org_children(adapter, org_id, include_inactive) {
    try {
        const org_service = createCrudService(adapter, TABLE_NAME);
        const children = await org_service.findBy({ parent_org_id: org_id });
        if (!Array.isArray(children)) {
            return {
                success: true,
                orgs: [],
            };
        }
        // Filter inactive if not requested
        let filtered = children;
        if (!include_inactive) {
            filtered = filtered.filter((org) => org.active !== false);
        }
        return {
            success: true,
            orgs: filtered,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "get_org_children",
                org_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Gets all ancestors of an organization up to root
 * Returns array ordered from immediate parent to root
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @returns Ancestor organizations
 */
export async function get_org_ancestors(adapter, org_id) {
    try {
        const ancestors = [];
        // Get the org first
        const org_result = await get_org_by_id(adapter, org_id);
        if (!org_result.success || !org_result.org) {
            return {
                success: false,
                error: org_result.error || "Organization not found",
            };
        }
        let current_org = org_result.org;
        // Walk up the hierarchy
        while (current_org.parent_org_id) {
            const parent_result = await get_org_by_id(adapter, current_org.parent_org_id);
            if (!parent_result.success || !parent_result.org)
                break;
            ancestors.push(parent_result.org);
            current_org = parent_result.org;
        }
        return {
            success: true,
            orgs: ancestors,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "get_org_ancestors",
                org_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Gets all descendants of an organization
 * Returns flat array of all descendant orgs
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @returns Descendant organizations
 */
export async function get_org_descendants(adapter, org_id, include_inactive) {
    try {
        const descendants = [];
        // Recursive function to collect all children
        async function collect_descendants(current_id) {
            const children_result = await get_org_children(adapter, current_id, include_inactive);
            if (children_result.success && children_result.orgs) {
                for (const child of children_result.orgs) {
                    descendants.push(child);
                    await collect_descendants(child.id);
                }
            }
        }
        await collect_descendants(org_id);
        return {
            success: true,
            orgs: descendants,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "get_org_descendants",
                org_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Gets organization hierarchy tree
 * @param adapter - HazoConnect adapter
 * @param root_org_id - Optional root org ID to start from (global admin: no filter)
 * @param include_inactive - Include inactive orgs in tree
 * @returns Nested organization tree
 */
export async function get_org_tree(adapter, root_org_id, include_inactive) {
    try {
        const org_service = createCrudService(adapter, TABLE_NAME);
        // Get root-level orgs (those without parent_org_id)
        let root_orgs;
        if (root_org_id) {
            // Get specific root org
            root_orgs = await org_service.findBy({ id: root_org_id });
        }
        else {
            // Get all root orgs (no parent)
            const all_orgs = await org_service.findBy({});
            if (Array.isArray(all_orgs)) {
                root_orgs = all_orgs.filter((org) => org.parent_org_id === null);
            }
            else {
                root_orgs = [];
            }
        }
        if (!Array.isArray(root_orgs)) {
            return {
                success: true,
                tree: [],
            };
        }
        // Filter inactive if not requested
        let filtered_roots = root_orgs;
        if (!include_inactive) {
            filtered_roots = filtered_roots.filter((org) => org.active !== false);
        }
        // Build tree recursively
        async function build_tree(org) {
            // Get user count
            const count_result = await get_org_user_count(adapter, org.id);
            const current_user_count = count_result.success ? count_result.count : 0;
            const node = Object.assign(Object.assign({}, org), { current_user_count, children: [] });
            const children_result = await get_org_children(adapter, org.id, include_inactive);
            if (children_result.success && children_result.orgs) {
                for (const child of children_result.orgs) {
                    const child_node = await build_tree(child);
                    node.children.push(child_node);
                }
            }
            return node;
        }
        const tree = [];
        for (const root_org of filtered_roots) {
            const node = await build_tree(root_org);
            tree.push(node);
        }
        return {
            success: true,
            tree,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "get_org_tree",
                root_org_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Checks if a user can be added to an organization (user_limit check)
 * Only applies to root-level orgs (checks root_org's user_limit)
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @returns Whether user can be added and reason if not
 */
export async function can_add_user_to_org(adapter, org_id) {
    try {
        // Get the org
        const org_result = await get_org_by_id(adapter, org_id);
        if (!org_result.success || !org_result.org) {
            return {
                success: false,
                can_add: false,
                error: org_result.error || "Organization not found",
            };
        }
        const org = org_result.org;
        // If org is inactive, can't add users
        if (org.active === false) {
            return {
                success: true,
                can_add: false,
                reason: "Organization is inactive",
            };
        }
        // Determine which user_limit to check (root org's limit)
        let root_org_id = org.root_org_id || org.id;
        let root_org;
        if (root_org_id === org.id) {
            root_org = org;
        }
        else {
            const root_result = await get_org_by_id(adapter, root_org_id);
            if (!root_result.success || !root_result.org) {
                // If can't find root, assume no limit
                return {
                    success: true,
                    can_add: true,
                };
            }
            root_org = root_result.org;
        }
        // If user_limit is 0, unlimited
        if (root_org.user_limit === 0) {
            return {
                success: true,
                can_add: true,
            };
        }
        // Get total user count for root org tree
        const count_result = await get_root_org_user_count(adapter, root_org.id);
        if (!count_result.success) {
            return {
                success: true,
                can_add: true, // Assume can add if can't check
            };
        }
        const current_count = count_result.count;
        if (current_count >= root_org.user_limit) {
            return {
                success: true,
                can_add: false,
                reason: `Organization user limit reached (${current_count}/${root_org.user_limit})`,
            };
        }
        return {
            success: true,
            can_add: true,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "can_add_user_to_org",
                org_id,
            },
        });
        return {
            success: false,
            can_add: false,
            error: error_message,
        };
    }
}
/**
 * Checks if user has access to an organization (is in org's hierarchy)
 * @param adapter - HazoConnect adapter
 * @param user_org_id - User's org_id
 * @param user_root_org_id - User's root_org_id
 * @param target_org_id - Target org to check access to
 * @returns Whether user has access
 */
export async function check_user_org_access(adapter, user_org_id, user_root_org_id, target_org_id) {
    try {
        // If user has no org, no access
        if (!user_org_id && !user_root_org_id) {
            return {
                success: true,
                has_access: false,
            };
        }
        // Get target org
        const target_result = await get_org_by_id(adapter, target_org_id);
        if (!target_result.success || !target_result.org) {
            return {
                success: true,
                has_access: false,
            };
        }
        const target_org = target_result.org;
        // Check if target is in user's org tree
        const target_root = target_org.root_org_id || target_org.id;
        // User has access if they share the same root org
        if (user_root_org_id === target_root || user_org_id === target_root) {
            return {
                success: true,
                has_access: true,
            };
        }
        // Or if user's org_id matches the target
        if (user_org_id === target_org_id) {
            return {
                success: true,
                has_access: true,
            };
        }
        return {
            success: true,
            has_access: false,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "org_service.ts",
                line_number: 0,
                operation: "check_user_org_access",
                user_org_id,
                target_org_id,
            },
        });
        return {
            success: false,
            has_access: false,
            error: error_message,
        };
    }
}
