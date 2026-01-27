import "server-only";
/**
 * Scope hierarchy configuration options for HRBAC
 * Uses unified hazo_scopes table with parent_id for hierarchy
 */
export type ScopeHierarchyConfig = {
    /** Whether HRBAC is enabled (default: false) */
    enable_hrbac: boolean;
    /** Cache TTL in minutes for scope lookups (default: 15) */
    scope_cache_ttl_minutes: number;
    /** Maximum entries in scope cache (default: 5000) */
    scope_cache_max_entries: number;
    /** Super admin scope ID */
    super_admin_scope_id: string;
    /** Default system scope ID (for non-multi-tenancy mode) */
    default_system_scope_id: string;
};
/**
 * Reads HRBAC scope hierarchy configuration from hazo_auth_config.ini file
 * Falls back to defaults if config file is not found or section is missing
 * @returns Scope hierarchy configuration options
 */
export declare function get_scope_hierarchy_config(): ScopeHierarchyConfig;
/**
 * Checks if HRBAC is enabled in the configuration
 * Convenience function for quick checks
 */
export declare function is_hrbac_enabled(): boolean;
//# sourceMappingURL=scope_hierarchy_config.server.d.ts.map