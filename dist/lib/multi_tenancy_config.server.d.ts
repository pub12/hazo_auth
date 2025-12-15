/**
 * Multi-tenancy configuration options
 */
export type MultiTenancyConfig = {
    /** Whether multi-tenancy is enabled (default: false) */
    enable_multi_tenancy: boolean;
    /** Cache TTL in minutes for org lookups (default: 15) */
    org_cache_ttl_minutes: number;
    /** Maximum entries in org cache (default: 1000) */
    org_cache_max_entries: number;
    /** Default user limit per organization (0 = unlimited) */
    default_user_limit: number;
};
/**
 * Reads multi-tenancy configuration from hazo_auth_config.ini file
 * Falls back to defaults if config file is not found or section is missing
 * @returns Multi-tenancy configuration options
 */
export declare function get_multi_tenancy_config(): MultiTenancyConfig;
/**
 * Checks if multi-tenancy is enabled in the configuration
 * Convenience function for quick checks
 */
export declare function is_multi_tenancy_enabled(): boolean;
/**
 * Gets the default user limit from config
 * Returns 0 if not configured (unlimited)
 */
export declare function get_default_user_limit(): number;
//# sourceMappingURL=multi_tenancy_config.server.d.ts.map