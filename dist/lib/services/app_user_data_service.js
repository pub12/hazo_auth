import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger.js";
import { sanitize_error_for_user } from "../utils/error_sanitizer.js";
import { get_auth_cache } from "../auth/auth_cache.js";
import { get_auth_utility_config } from "../auth_utility_config.server.js";
// section: helpers
/**
 * Deep merge two objects. Arrays are replaced, not merged.
 * @param target - Target object
 * @param source - Source object to merge into target
 * @returns Merged object
 */
function deep_merge(target, source) {
    const result = Object.assign({}, target);
    for (const key of Object.keys(source)) {
        const source_value = source[key];
        const target_value = target[key];
        if (source_value !== null &&
            typeof source_value === "object" &&
            !Array.isArray(source_value) &&
            target_value !== null &&
            typeof target_value === "object" &&
            !Array.isArray(target_value)) {
            // Both are objects, recursively merge
            result[key] = deep_merge(target_value, source_value);
        }
        else {
            // Replace value (including arrays)
            result[key] = source_value;
        }
    }
    return result;
}
/**
 * Parse JSON string to object, returning null on failure
 * @param json_string - JSON string to parse
 * @returns Parsed object or null
 */
function parse_app_user_data(json_string) {
    if (json_string === null || json_string === undefined || json_string === "") {
        return null;
    }
    if (typeof json_string !== "string") {
        return null;
    }
    try {
        const parsed = JSON.parse(json_string);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            return parsed;
        }
        return null;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Invalidate auth cache for a user after updating app_user_data
 * @param user_id - User ID to invalidate
 */
function invalidate_auth_cache(user_id) {
    try {
        const config = get_auth_utility_config();
        const cache = get_auth_cache(config.cache_max_users, config.cache_ttl_minutes, config.cache_max_age_minutes);
        cache.invalidate_user(user_id);
    }
    catch (_a) {
        // Cache invalidation is best-effort, don't fail the operation
    }
}
// section: main functions
/**
 * Get app_user_data for a user
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user ID to get data for
 * @returns App user data result with data or error
 */
export async function get_app_user_data(adapter, user_id) {
    try {
        const users_service = createCrudService(adapter, "hazo_users");
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return {
                success: false,
                data: null,
                error: "User not found",
            };
        }
        const user = users[0];
        const data = parse_app_user_data(user.app_user_data);
        return {
            success: true,
            data,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const user_friendly_error = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "app_user_data_service.ts",
                user_id,
                operation: "get_app_user_data",
            },
        });
        return {
            success: false,
            data: null,
            error: user_friendly_error,
        };
    }
}
/**
 * Update app_user_data for a user
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user ID to update
 * @param data - Data to store (will be JSON stringified)
 * @param options - Update options (merge or replace)
 * @returns App user data result with updated data or error
 */
export async function update_app_user_data(adapter, user_id, data, options) {
    try {
        const merge = (options === null || options === void 0 ? void 0 : options.merge) !== false; // Default to merge mode
        const users_service = createCrudService(adapter, "hazo_users");
        // Get current user data
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return {
                success: false,
                data: null,
                error: "User not found",
            };
        }
        const user = users[0];
        let final_data;
        if (merge) {
            // Merge with existing data
            const existing_data = parse_app_user_data(user.app_user_data) || {};
            final_data = deep_merge(existing_data, data);
        }
        else {
            // Replace entirely
            final_data = data;
        }
        // Update database
        const update_data = {
            app_user_data: JSON.stringify(final_data),
            changed_at: new Date().toISOString(),
        };
        await users_service.updateById(user_id, update_data);
        // Invalidate auth cache
        invalidate_auth_cache(user_id);
        return {
            success: true,
            data: final_data,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const user_friendly_error = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "app_user_data_service.ts",
                user_id,
                operation: "update_app_user_data",
            },
        });
        return {
            success: false,
            data: null,
            error: user_friendly_error,
        };
    }
}
/**
 * Clear app_user_data for a user (set to null)
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user ID to clear data for
 * @returns App user data result
 */
export async function clear_app_user_data(adapter, user_id) {
    try {
        const users_service = createCrudService(adapter, "hazo_users");
        // Verify user exists
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return {
                success: false,
                data: null,
                error: "User not found",
            };
        }
        // Clear the data
        const update_data = {
            app_user_data: null,
            changed_at: new Date().toISOString(),
        };
        await users_service.updateById(user_id, update_data);
        // Invalidate auth cache
        invalidate_auth_cache(user_id);
        return {
            success: true,
            data: null,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const user_friendly_error = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "app_user_data_service.ts",
                user_id,
                operation: "clear_app_user_data",
            },
        });
        return {
            success: false,
            data: null,
            error: user_friendly_error,
        };
    }
}
