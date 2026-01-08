import type { HazoAuthUser, ScopeDetails } from "./auth_types";
/**
 * Cache entry structure
 * v5.x: role_ids are now string UUIDs (from hazo_user_scopes)
 * v5.2: Added scopes with full details for multi-tenancy support
 */
type CacheEntry = {
    user: HazoAuthUser;
    permissions: string[];
    role_ids: string[];
    scopes: ScopeDetails[];
    timestamp: number;
    cache_version: number;
};
/**
 * LRU cache implementation with TTL and size limits
 * Uses Map to maintain insertion order for LRU eviction
 */
declare class AuthCache {
    private cache;
    private max_size;
    private ttl_ms;
    private max_age_ms;
    private role_version_map;
    constructor(max_size: number, ttl_minutes: number, max_age_minutes: number);
    /**
     * Gets a cache entry for a user
     * Returns undefined if not found, expired, or too old
     * @param user_id - User ID to look up
     * @returns Cache entry or undefined
     */
    get(user_id: string): CacheEntry | undefined;
    /**
     * Sets a cache entry for a user
     * Evicts least recently used entries if cache is full
     * @param user_id - User ID
     * @param user - User data
     * @param permissions - User permissions
     * @param role_ids - User role IDs (v5.x: string UUIDs)
     * @param scopes - User scope details with full information (v5.2+)
     */
    set(user_id: string, user: HazoAuthUser, permissions: string[], role_ids: string[], scopes?: ScopeDetails[]): void;
    /**
     * Invalidates cache for a specific user
     * @param user_id - User ID to invalidate
     */
    invalidate_user(user_id: string): void;
    /**
     * Invalidates cache for all users with specific roles
     * Uses cache version to determine if invalidation is needed
     * @param role_ids - Array of role IDs to invalidate (v5.x: string UUIDs)
     */
    invalidate_by_roles(role_ids: string[]): void;
    /**
     * Invalidates all cache entries
     */
    invalidate_all(): void;
    /**
     * Invalidates cache entries for users who have access to specific scopes
     * Used when scope details change (name, branding, etc.)
     * @param scope_ids - Array of scope IDs to invalidate
     */
    invalidate_by_scope_ids(scope_ids: string[]): void;
    /**
     * Gets the maximum cache version for a set of roles
     * Used to determine if cache entry is stale
     * @param role_ids - Array of role IDs (v5.x: string UUIDs)
     * @returns Maximum version number
     */
    private get_max_role_version;
    /**
     * Gets cache statistics
     * @returns Object with cache size, max size, and hit rate estimate
     */
    get_stats(): {
        size: number;
        max_size: number;
    };
}
/**
 * Gets or creates the global auth cache instance
 * @param max_size - Maximum cache size (default: 10000)
 * @param ttl_minutes - TTL in minutes (default: 15)
 * @param max_age_minutes - Max age in minutes (default: 30)
 * @returns Auth cache instance
 */
export declare function get_auth_cache(max_size?: number, ttl_minutes?: number, max_age_minutes?: number): AuthCache;
/**
 * Resets the global cache instance (useful for testing)
 */
export declare function reset_auth_cache(): void;
export {};
//# sourceMappingURL=auth_cache.d.ts.map