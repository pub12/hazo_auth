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
 * @returns Cookie prefix string (empty string if not set)
 */
export function get_cookie_prefix_edge() {
    return process.env.HAZO_AUTH_COOKIE_PREFIX || "";
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
