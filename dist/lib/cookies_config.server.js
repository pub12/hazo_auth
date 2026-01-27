// file_description: server-only helper to read cookie configuration from hazo_auth_config.ini
// section: server-only-guard
import "server-only";
import { read_config_section } from "./config/config_loader.server.js";
// section: defaults
const DEFAULT_CONFIG = {
    cookie_prefix: "",
    cookie_domain: "",
};
// section: constants
const SECTION_NAME = "hazo_auth__cookies";
// Base cookie names (without prefix)
export const BASE_COOKIE_NAMES = {
    USER_ID: "hazo_auth_user_id",
    USER_EMAIL: "hazo_auth_user_email",
    SESSION: "hazo_auth_session",
    DEV_LOCK: "hazo_auth_dev_lock",
    SCOPE_ID: "hazo_auth_scope_id", // v5.2: Tenant context cookie for multi-tenancy
};
// section: main_function
/**
 * Reads cookie configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns CookiesConfig object with all cookie settings
 */
export function get_cookies_config() {
    const section = read_config_section(SECTION_NAME);
    if (!section) {
        return DEFAULT_CONFIG;
    }
    return {
        cookie_prefix: section.cookie_prefix || DEFAULT_CONFIG.cookie_prefix,
        cookie_domain: section.cookie_domain || DEFAULT_CONFIG.cookie_domain,
    };
}
/**
 * Gets the full cookie name with prefix applied
 * @param base_name - Base cookie name from BASE_COOKIE_NAMES
 * @returns Full cookie name with prefix
 */
export function get_cookie_name(base_name) {
    const config = get_cookies_config();
    return `${config.cookie_prefix}${base_name}`;
}
/**
 * Gets cookie options with domain if configured
 * @param options - Base cookie options
 * @returns Cookie options with domain added if configured
 */
export function get_cookie_options(options) {
    const config = get_cookies_config();
    if (config.cookie_domain) {
        return Object.assign(Object.assign({}, options), { domain: config.cookie_domain });
    }
    return options;
}
// Cached config for performance (module-level cache)
let cached_config = null;
/**
 * Gets cached cookie configuration for performance-critical paths
 * @returns CookiesConfig object
 */
export function get_cached_cookies_config() {
    if (!cached_config) {
        cached_config = get_cookies_config();
    }
    return cached_config;
}
/**
 * Clears the cached config (useful for testing)
 */
export function clear_cookies_config_cache() {
    cached_config = null;
}
