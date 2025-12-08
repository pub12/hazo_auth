import type { ScopeLevel } from "./services/scope_service";
/**
 * Scope hierarchy configuration options for HRBAC
 */
export type ScopeHierarchyConfig = {
    /** Whether HRBAC is enabled (default: false) */
    enable_hrbac: boolean;
    /** Default organization for single-tenant apps (optional) */
    default_org: string;
    /** Cache TTL in minutes for scope lookups (default: 15) */
    scope_cache_ttl_minutes: number;
    /** Maximum entries in scope cache (default: 5000) */
    scope_cache_max_entries: number;
    /** Which scope levels are active/enabled */
    active_levels: ScopeLevel[];
    /** Default labels for each scope level */
    default_labels: Record<ScopeLevel, string>;
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
/**
 * Gets the default organization from config
 * Returns empty string if not configured (multi-tenant mode)
 */
export declare function get_default_org(): string;
/**
 * Gets the default label for a scope level
 */
export declare function get_default_label(level: ScopeLevel): string;
//# sourceMappingURL=scope_hierarchy_config.server.d.ts.map