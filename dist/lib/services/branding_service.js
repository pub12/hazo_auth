import { get_scope_by_id, get_root_scope_id, update_scope, is_system_scope, extract_branding, has_branding, } from "./scope_service.js";
import { create_app_logger } from "../app_logger.js";
import { sanitize_error_for_user } from "../utils/error_sanitizer.js";
// section: validation
/**
 * Validates a hex color string
 */
function is_valid_hex_color(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
}
/**
 * Validates branding data
 */
export function validate_branding(data) {
    // Validate colors only if they are non-null strings
    if (data.primary_color && typeof data.primary_color === "string" && !is_valid_hex_color(data.primary_color)) {
        return { valid: false, error: "Invalid primary color format (use #RRGGBB)" };
    }
    if (data.secondary_color && typeof data.secondary_color === "string" && !is_valid_hex_color(data.secondary_color)) {
        return {
            valid: false,
            error: "Invalid secondary color format (use #RRGGBB)",
        };
    }
    if (data.tagline && typeof data.tagline === "string" && data.tagline.length > 200) {
        return { valid: false, error: "Tagline must be 200 characters or less" };
    }
    if (data.logo_url && typeof data.logo_url === "string" && data.logo_url.length > 500) {
        return { valid: false, error: "Logo URL must be 500 characters or less" };
    }
    return { valid: true };
}
// section: core operations
/**
 * Gets branding for a specific scope (does not resolve inheritance)
 * Use get_effective_branding for inherited branding
 */
export async function get_scope_branding(adapter, scope_id) {
    try {
        const scope_result = await get_scope_by_id(adapter, scope_id);
        if (!scope_result.success || !scope_result.scope) {
            return {
                success: false,
                error: scope_result.error || "Scope not found",
            };
        }
        return {
            success: true,
            branding: extract_branding(scope_result.scope),
            scope: scope_result.scope,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "branding_service.ts",
                line_number: 0,
                operation: "get_scope_branding",
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
 * Gets effective branding for a scope, resolving inheritance from root scope
 * If the scope is a child, it will traverse up to the root scope to get branding
 */
export async function get_effective_branding(adapter, scope_id) {
    try {
        // Get the scope first
        const scope_result = await get_scope_by_id(adapter, scope_id);
        if (!scope_result.success || !scope_result.scope) {
            return {
                success: false,
                error: scope_result.error || "Scope not found",
            };
        }
        const scope = scope_result.scope;
        // If this scope has branding, use it
        if (has_branding(scope)) {
            return {
                success: true,
                branding: extract_branding(scope),
                scope,
            };
        }
        // If no parent (this is a root scope), return null branding
        if (!scope.parent_id) {
            return {
                success: true,
                branding: null,
                scope,
            };
        }
        // Find the root scope and get its branding
        const root_id = await get_root_scope_id(adapter, scope_id);
        if (!root_id || root_id === scope_id) {
            return {
                success: true,
                branding: null,
                scope,
            };
        }
        const root_result = await get_scope_by_id(adapter, root_id);
        if (!root_result.success || !root_result.scope) {
            return {
                success: true,
                branding: null,
                scope,
            };
        }
        return {
            success: true,
            branding: extract_branding(root_result.scope),
            scope, // Return the original scope, not the root
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "branding_service.ts",
                line_number: 0,
                operation: "get_effective_branding",
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
 * Updates branding for a scope (merges with existing branding)
 * Only root scopes (parent_id = null) should typically have branding set
 */
export async function update_branding(adapter, scope_id, data) {
    try {
        // Prevent updating system scopes
        if (is_system_scope(scope_id)) {
            return {
                success: false,
                error: "Cannot modify branding for system scopes",
            };
        }
        // Validate the branding data
        const validation = validate_branding(data);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error,
            };
        }
        // Get current scope
        const scope_result = await get_scope_by_id(adapter, scope_id);
        if (!scope_result.success || !scope_result.scope) {
            return {
                success: false,
                error: scope_result.error || "Scope not found",
            };
        }
        // Merge with existing branding - only update fields that are provided
        const current = scope_result.scope;
        const updated_logo = data.logo_url !== undefined ? data.logo_url : current.logo_url;
        const updated_primary = data.primary_color !== undefined ? data.primary_color : current.primary_color;
        const updated_secondary = data.secondary_color !== undefined ? data.secondary_color : current.secondary_color;
        const updated_tagline = data.tagline !== undefined ? data.tagline : current.tagline;
        // Update the scope with individual fields
        const update_result = await update_scope(adapter, scope_id, {
            logo_url: updated_logo || null,
            primary_color: updated_primary || null,
            secondary_color: updated_secondary || null,
            tagline: updated_tagline || null,
        });
        if (!update_result.success) {
            return {
                success: false,
                error: update_result.error,
            };
        }
        return {
            success: true,
            branding: extract_branding(update_result.scope),
            scope: update_result.scope,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "branding_service.ts",
                line_number: 0,
                operation: "update_branding",
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
 * Replaces branding entirely for a scope
 */
export async function replace_branding(adapter, scope_id, branding) {
    try {
        // Prevent updating system scopes
        if (is_system_scope(scope_id)) {
            return {
                success: false,
                error: "Cannot modify branding for system scopes",
            };
        }
        // Validate the branding data if provided
        if (branding) {
            const validation = validate_branding(branding);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error,
                };
            }
        }
        // Update the scope with individual branding fields (or null to clear)
        const update_result = await update_scope(adapter, scope_id, {
            logo_url: (branding === null || branding === void 0 ? void 0 : branding.logo_url) || null,
            primary_color: (branding === null || branding === void 0 ? void 0 : branding.primary_color) || null,
            secondary_color: (branding === null || branding === void 0 ? void 0 : branding.secondary_color) || null,
            tagline: (branding === null || branding === void 0 ? void 0 : branding.tagline) || null,
        });
        if (!update_result.success) {
            return {
                success: false,
                error: update_result.error,
            };
        }
        return {
            success: true,
            branding: branding ? extract_branding(update_result.scope) : null,
            scope: update_result.scope,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "branding_service.ts",
                line_number: 0,
                operation: "replace_branding",
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
 * Clears branding for a scope
 */
export async function clear_branding(adapter, scope_id) {
    return replace_branding(adapter, scope_id, null);
}
/**
 * Gets branding for a user based on their root scope
 * This is typically used to get the firm branding for a user
 */
export async function get_user_firm_branding(adapter, user_scope_id) {
    try {
        // Get the root scope for this user's scope
        const root_id = await get_root_scope_id(adapter, user_scope_id);
        if (!root_id) {
            return {
                success: true,
                branding: null,
            };
        }
        // Get the branding from the root scope
        return get_scope_branding(adapter, root_id);
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "branding_service.ts",
                line_number: 0,
                operation: "get_user_firm_branding",
                user_scope_id,
            },
        });
        return {
            success: false,
            error: error_message,
        };
    }
}
