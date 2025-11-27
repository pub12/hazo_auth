// file_description: server-only helper to read user profiles cache configuration from hazo_auth_config.ini
// section: imports
import { get_config_number, } from "./config/config_loader.server";
// section: helpers
/**
 * Reads user profiles cache configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns User profiles cache configuration options
 */
export function get_user_profiles_cache_config() {
    const section_name = "hazo_auth__user_profiles";
    // Cache settings
    // cache_enabled: 0 = disabled, 1 = enabled (default: 1)
    const cache_enabled_num = get_config_number(section_name, "cache_enabled", 1);
    const cache_enabled = cache_enabled_num === 1;
    const cache_max_entries = get_config_number(section_name, "cache_max_entries", 5000);
    const cache_ttl_minutes = get_config_number(section_name, "cache_ttl_minutes", 5);
    return {
        cache_enabled,
        cache_max_entries,
        cache_ttl_minutes,
    };
}
