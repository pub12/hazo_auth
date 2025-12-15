/**
 * Cached organization info for hazo_get_auth
 */
export type OrgCacheEntry = {
    org_id: string;
    org_name: string;
    parent_org_id: string | null;
    parent_org_name: string | null;
    root_org_id: string | null;
    root_org_name: string | null;
};
/**
 * LRU cache implementation for organization lookups
 * Uses Map to maintain insertion order for LRU eviction
 */
declare class OrgCache {
    private cache;
    private max_size;
    private ttl_ms;
    constructor(max_size: number, ttl_minutes: number);
    /**
     * Gets a cache entry for an organization
     * Returns undefined if not found or expired
     * @param org_id - Organization ID to look up
     * @returns Cache entry or undefined
     */
    get(org_id: string): OrgCacheEntry | undefined;
    /**
     * Sets a cache entry for an organization
     * Evicts least recently used entries if cache is full
     * @param org_id - Organization ID
     * @param entry - Organization cache entry
     */
    set(org_id: string, entry: OrgCacheEntry): void;
    /**
     * Invalidates cache for a specific organization
     * @param org_id - Organization ID to invalidate
     */
    invalidate(org_id: string): void;
    /**
     * Invalidates all cache entries
     */
    invalidate_all(): void;
    /**
     * Gets cache statistics
     * @returns Object with cache size and max size
     */
    get_stats(): {
        size: number;
        max_size: number;
    };
}
/**
 * Gets or creates the global org cache instance
 * @param max_size - Maximum cache size (default: 1000)
 * @param ttl_minutes - TTL in minutes (default: 15)
 * @returns Org cache instance
 */
export declare function get_org_cache(max_size?: number, ttl_minutes?: number): OrgCache;
/**
 * Resets the global org cache instance (useful for testing)
 */
export declare function reset_org_cache(): void;
export {};
//# sourceMappingURL=org_cache.d.ts.map