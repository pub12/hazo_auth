export type CookiesConfig = {
    /** Prefix for all hazo_auth cookies (e.g., "myapp_" results in "myapp_hazo_auth_session") */
    cookie_prefix: string;
    /** Optional domain for cookies (e.g., ".example.com" for cross-subdomain) */
    cookie_domain: string;
};
export declare const BASE_COOKIE_NAMES: {
    readonly USER_ID: "hazo_auth_user_id";
    readonly USER_EMAIL: "hazo_auth_user_email";
    readonly SESSION: "hazo_auth_session";
    readonly DEV_LOCK: "hazo_auth_dev_lock";
    readonly SCOPE_ID: "hazo_auth_scope_id";
};
/**
 * Reads cookie configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns CookiesConfig object with all cookie settings
 */
export declare function get_cookies_config(): CookiesConfig;
/**
 * Gets the full cookie name with prefix applied
 * @param base_name - Base cookie name from BASE_COOKIE_NAMES
 * @returns Full cookie name with prefix
 */
export declare function get_cookie_name(base_name: string): string;
/**
 * Gets cookie options with domain if configured
 * @param options - Base cookie options
 * @returns Cookie options with domain added if configured
 */
export declare function get_cookie_options<T extends Record<string, unknown>>(options: T): T & {
    domain?: string;
};
/**
 * Gets cached cookie configuration for performance-critical paths
 * @returns CookiesConfig object
 */
export declare function get_cached_cookies_config(): CookiesConfig;
/**
 * Clears the cached config (useful for testing)
 */
export declare function clear_cookies_config_cache(): void;
//# sourceMappingURL=cookies_config.server.d.ts.map