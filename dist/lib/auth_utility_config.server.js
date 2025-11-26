// file_description: server-only helper to read auth utility configuration from hazo_auth_config.ini
// section: imports
import { get_config_value, get_config_number, get_config_boolean, } from "hazo_auth/lib/config/config_loader.server";
// section: helpers
/**
 * Parses permission error messages from config string
 * Format: "permission1:message1,permission2:message2"
 * @param config_value - Config string value
 * @returns Map of permission to user-friendly message
 */
function parse_permission_messages(config_value) {
    const messages = new Map();
    if (!config_value || config_value.trim().length === 0) {
        return messages;
    }
    const pairs = config_value.split(",");
    for (const pair of pairs) {
        const trimmed = pair.trim();
        if (trimmed.length === 0) {
            continue;
        }
        const colon_index = trimmed.indexOf(":");
        if (colon_index === -1) {
            continue; // Skip invalid format
        }
        const permission = trimmed.substring(0, colon_index).trim();
        const message = trimmed.substring(colon_index + 1).trim();
        if (permission.length > 0 && message.length > 0) {
            messages.set(permission, message);
        }
    }
    return messages;
}
/**
 * Reads auth utility configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Auth utility configuration options
 */
export function get_auth_utility_config() {
    const section_name = "hazo_auth__auth_utility";
    // Cache settings
    const cache_max_users = get_config_number(section_name, "cache_max_users", 10000);
    const cache_ttl_minutes = get_config_number(section_name, "cache_ttl_minutes", 15);
    const cache_max_age_minutes = get_config_number(section_name, "cache_max_age_minutes", 30);
    // Rate limiting
    const rate_limit_per_user = get_config_number(section_name, "rate_limit_per_user", 100);
    const rate_limit_per_ip = get_config_number(section_name, "rate_limit_per_ip", 200);
    // Permission check behavior
    const log_permission_denials = get_config_boolean(section_name, "log_permission_denials", true);
    const enable_friendly_error_messages = get_config_boolean(section_name, "enable_friendly_error_messages", true);
    // Permission message mappings
    const permission_messages_str = get_config_value(section_name, "permission_error_messages", "");
    const permission_error_messages = parse_permission_messages(permission_messages_str);
    return {
        cache_max_users,
        cache_ttl_minutes,
        cache_max_age_minutes,
        rate_limit_per_user,
        rate_limit_per_ip,
        log_permission_denials,
        enable_friendly_error_messages,
        permission_error_messages,
    };
}
