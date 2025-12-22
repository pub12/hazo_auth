// file_description: server-only helper to read user types configuration from hazo_auth_config.ini
// section: imports
import { get_config_value, get_config_boolean, read_config_section, } from "./config/config_loader.server";
import { DEFAULT_USER_TYPES } from "./config/default_config";
// section: constants
const SECTION_NAME = "hazo_auth__user_types";
const PRESET_COLORS = new Set([
    "blue",
    "green",
    "red",
    "yellow",
    "purple",
    "gray",
    "orange",
    "pink",
]);
// section: helpers
/**
 * Parses a user type definition string
 * Format: key:label:color (e.g., "admin:Administrator:red" or "custom:Custom Type:#4CAF50")
 * @param value - The config value string
 * @returns UserTypeDefinition or null if invalid
 */
function parse_user_type_definition(value) {
    const parts = value.split(":").map((s) => s.trim());
    if (parts.length < 2)
        return null;
    const key = parts[0];
    const label = parts[1];
    const badge_color = parts[2] || "gray";
    if (!key || !label)
        return null;
    return {
        key,
        label,
        badge_color,
        is_preset_color: PRESET_COLORS.has(badge_color),
    };
}
/**
 * Reads user types configuration from hazo_auth_config.ini file
 * Falls back to defaults if config file is not found or section is missing
 * @returns User types configuration options
 */
export function get_user_types_config() {
    const enable_user_types = get_config_boolean(SECTION_NAME, "enable_user_types", DEFAULT_USER_TYPES.enable_user_types);
    const default_user_type = get_config_value(SECTION_NAME, "default_user_type", DEFAULT_USER_TYPES.default_user_type);
    // Parse user type definitions from config
    const user_types = new Map();
    const section = read_config_section(SECTION_NAME);
    if (section) {
        // Look for user_type_1, user_type_2, etc. (up to 50 types supported)
        for (let i = 1; i <= 50; i++) {
            const key = `user_type_${i}`;
            const value = section[key];
            if (!value)
                continue;
            const type_def = parse_user_type_definition(value);
            if (type_def) {
                user_types.set(type_def.key, type_def);
            }
        }
    }
    return {
        enable_user_types,
        default_user_type,
        user_types,
    };
}
/**
 * Checks if user types feature is enabled in the configuration
 * Convenience function for quick checks
 */
export function is_user_types_enabled() {
    return get_config_boolean(SECTION_NAME, "enable_user_types", DEFAULT_USER_TYPES.enable_user_types);
}
/**
 * Gets the default user type from config
 * Returns empty string if not configured
 */
export function get_default_user_type() {
    return get_config_value(SECTION_NAME, "default_user_type", DEFAULT_USER_TYPES.default_user_type);
}
/**
 * Gets user type definition by key
 * @param type_key - The user type key
 * @returns UserTypeDefinition or undefined if not found
 */
export function get_user_type_by_key(type_key) {
    const config = get_user_types_config();
    return config.user_types.get(type_key);
}
/**
 * Gets all user type definitions as array (for UI dropdowns)
 * @returns Array of UserTypeDefinition objects
 */
export function get_all_user_types() {
    const config = get_user_types_config();
    return Array.from(config.user_types.values());
}
