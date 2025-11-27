import type { UserProfileInfo } from "./user_profiles_service";
/**
 * LRU cache implementation with TTL and size limits for user profiles
 * Uses Map to maintain insertion order for LRU eviction
 */
declare class UserProfilesCache {
    private cache;
    private max_size;
    private ttl_ms;
    constructor(max_size: number, ttl_minutes: number);
    /**
     * Gets a cached profile for a user
     * Returns undefined if not found or expired
     * @param user_id - User ID to look up
     * @returns Profile or undefined
     */
    get(user_id: string): UserProfileInfo | undefined;
    /**
     * Gets multiple profiles from cache
     * Returns object with found profiles and missing IDs
     * @param user_ids - Array of user IDs to look up
     * @returns Object with cached profiles and IDs not in cache
     */
    get_many(user_ids: string[]): {
        cached: UserProfileInfo[];
        missing_ids: string[];
    };
    /**
     * Sets a cache entry for a user profile
     * Evicts least recently used entries if cache is full
     * @param user_id - User ID
     * @param profile - User profile data
     */
    set(user_id: string, profile: UserProfileInfo): void;
    /**
     * Sets multiple cache entries at once
     * @param profiles - Array of user profiles to cache
     */
    set_many(profiles: UserProfileInfo[]): void;
    /**
     * Invalidates cache for a specific user
     * @param user_id - User ID to invalidate
     */
    invalidate_user(user_id: string): void;
    /**
     * Invalidates cache for multiple users
     * @param user_ids - Array of user IDs to invalidate
     */
    invalidate_users(user_ids: string[]): void;
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
        ttl_minutes: number;
    };
}
/**
 * Gets or creates the global user profiles cache instance
 * @param max_size - Maximum cache size (default: 5000)
 * @param ttl_minutes - TTL in minutes (default: 5)
 * @returns User profiles cache instance
 */
export declare function get_user_profiles_cache(max_size?: number, ttl_minutes?: number): UserProfilesCache;
/**
 * Resets the global cache instance (useful for testing)
 */
export declare function reset_user_profiles_cache(): void;
export {};
//# sourceMappingURL=user_profiles_cache.d.ts.map