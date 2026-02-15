export declare const BASE_COOKIE_NAMES: {
    readonly USER_ID: "hazo_auth_user_id";
    readonly USER_EMAIL: "hazo_auth_user_email";
    readonly SESSION: "hazo_auth_session";
    readonly DEV_LOCK: "hazo_auth_dev_lock";
};
/**
 * Gets the cookie prefix from environment variable
 * For Edge runtime, use HAZO_AUTH_COOKIE_PREFIX env var
 * REQUIRED - throws if not set
 * @returns Cookie prefix string
 */
export declare function get_cookie_prefix_edge(): string;
/**
 * Gets the cookie domain from environment variable
 * For Edge runtime, use HAZO_AUTH_COOKIE_DOMAIN env var
 * @returns Cookie domain string (empty string if not set)
 */
export declare function get_cookie_domain_edge(): string;
/**
 * Gets the full cookie name with prefix applied (Edge-compatible)
 * @param base_name - Base cookie name from BASE_COOKIE_NAMES
 * @returns Full cookie name with prefix
 */
export declare function get_cookie_name_edge(base_name: string): string;
/**
 * Gets cookie options with domain if configured (Edge-compatible)
 * @param options - Base cookie options
 * @returns Cookie options with domain added if configured
 */
export declare function get_cookie_options_edge<T extends Record<string, unknown>>(options: T): T & {
    domain?: string;
};
//# sourceMappingURL=cookies_config.edge.d.ts.map