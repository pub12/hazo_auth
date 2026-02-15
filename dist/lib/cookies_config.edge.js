// file_description: Edge-compatible cookie configuration helper
// Uses environment variables since Edge runtime can't read config files
// section: constants
// Base cookie names (without prefix)
export const BASE_COOKIE_NAMES = {
    USER_ID: "hazo_auth_user_id",
    USER_EMAIL: "hazo_auth_user_email",
    SESSION: "hazo_auth_session",
    DEV_LOCK: "hazo_auth_dev_lock",
};
// section: main_functions
/**
 * Gets the cookie prefix from environment variable
 * For Edge runtime, use HAZO_AUTH_COOKIE_PREFIX env var
 * REQUIRED - throws if not set
 * @returns Cookie prefix string
 */
export function get_cookie_prefix_edge() {
    const prefix = process.env.HAZO_AUTH_COOKIE_PREFIX || "";
    if (!prefix) {
        throw new Error("[hazo_auth] HAZO_AUTH_COOKIE_PREFIX environment variable is required but not set.\n" +
            "Add to your .env.local:\n\n" +
            "  HAZO_AUTH_COOKIE_PREFIX=myapp_\n\n" +
            "This must match the cookie_prefix in [hazo_auth__cookies] section of hazo_auth_config.ini.\n" +
            "Edge runtime (middleware/proxy) cannot read config files, so the env var is required.");
    }
    return prefix;
}
/**
 * Gets the cookie domain from environment variable
 * For Edge runtime, use HAZO_AUTH_COOKIE_DOMAIN env var
 * @returns Cookie domain string (empty string if not set)
 */
export function get_cookie_domain_edge() {
    return process.env.HAZO_AUTH_COOKIE_DOMAIN || "";
}
/**
 * Gets the full cookie name with prefix applied (Edge-compatible)
 * @param base_name - Base cookie name from BASE_COOKIE_NAMES
 * @returns Full cookie name with prefix
 */
export function get_cookie_name_edge(base_name) {
    const prefix = get_cookie_prefix_edge();
    return `${prefix}${base_name}`;
}
/**
 * Gets cookie options with domain if configured (Edge-compatible)
 * @param options - Base cookie options
 * @returns Cookie options with domain added if configured
 */
export function get_cookie_options_edge(options) {
    const domain = get_cookie_domain_edge();
    if (domain) {
        return Object.assign(Object.assign({}, options), { domain });
    }
    return options;
}
