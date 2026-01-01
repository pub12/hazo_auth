/**
 * User scope assignment record
 */
export type UserScopeEntry = {
    scope_id: string;
    root_scope_id: string;
    role_id: string;
};
/**
 * Cache entry structure for user scopes
 */
type ScopeCacheEntry = {
    user_id: string;
    scopes: UserScopeEntry[];
    timestamp: number;
    cache_version: number;
};
/**
 * LRU cache implementation for user scope lookups
 * Uses Map to maintain insertion order for LRU eviction
 */
declare class ScopeCache {
    private cache;
    private max_size;
    private ttl_ms;
    private scope_version_map;
    constructor(max_size: number, ttl_minutes: number);
    /**
     * Gets a cache entry for a user's scopes
     * Returns undefined if not found or expired
     * @param user_id - User ID to look up
     * @returns Cache entry or undefined
     */
    get(user_id: string): ScopeCacheEntry | undefined;
    /**
     * Sets a cache entry for a user's scopes
     * Evicts least recently used entries if cache is full
     * @param user_id - User ID
     * @param scopes - User's scope assignments
     */
    set(user_id: string, scopes: UserScopeEntry[]): void;
    /**
     * Invalidates cache for a specific user
     * @param user_id - User ID to invalidate
     */
    invalidate_user(user_id: string): void;
    /**
     * Invalidates cache for all users with a specific scope
     * Uses cache version to determine if invalidation is needed
     * @param scope_id - Scope ID to invalidate
     */
    invalidate_by_scope(scope_id: string): void;
    /**
     * Invalidates cache for all users with any scope in a specific root scope tree
     * @param root_scope_id - Root scope ID to invalidate
     */
    invalidate_by_root_scope(root_scope_id: string): void;
    /**
     * Invalidates all cache entries
     */
    invalidate_all(): void;
    /**
     * Gets the maximum cache version for a set of scopes
     * Used to determine if cache entry is stale
     * @param scopes - Array of scope entries
     * @returns Maximum version number
     */
    private get_max_scope_version;
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
 * Gets or creates the global scope cache instance
 * @param max_size - Maximum cache size (default: 5000)
 * @param ttl_minutes - TTL in minutes (default: 15)
 * @returns Scope cache instance
 */
export declare function get_scope_cache(max_size?: number, ttl_minutes?: number): ScopeCache;
/**
 * Resets the global scope cache instance (useful for testing)
 */
export declare function reset_scope_cache(): void;
export {};
//# sourceMappingURL=scope_cache.d.ts.map