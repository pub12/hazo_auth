// section: cache_class
/**
 * LRU cache implementation with TTL and size limits for user profiles
 * Uses Map to maintain insertion order for LRU eviction
 */
class UserProfilesCache {
    constructor(max_size, ttl_minutes) {
        this.cache = new Map();
        this.max_size = max_size;
        this.ttl_ms = ttl_minutes * 60 * 1000;
    }
    /**
     * Gets a cached profile for a user
     * Returns undefined if not found or expired
     * @param user_id - User ID to look up
     * @returns Profile or undefined
     */
    get(user_id) {
        const entry = this.cache.get(user_id);
        if (!entry) {
            return undefined;
        }
        const now = Date.now();
        const age = now - entry.timestamp;
        // Check if entry is expired
        if (age > this.ttl_ms) {
            this.cache.delete(user_id);
            return undefined;
        }
        // Move to end (most recently used)
        this.cache.delete(user_id);
        this.cache.set(user_id, entry);
        return entry.profile;
    }
    /**
     * Gets multiple profiles from cache
     * Returns object with found profiles and missing IDs
     * @param user_ids - Array of user IDs to look up
     * @returns Object with cached profiles and IDs not in cache
     */
    get_many(user_ids) {
        const cached = [];
        const missing_ids = [];
        for (const user_id of user_ids) {
            const profile = this.get(user_id);
            if (profile) {
                cached.push(profile);
            }
            else {
                missing_ids.push(user_id);
            }
        }
        return { cached, missing_ids };
    }
    /**
     * Sets a cache entry for a user profile
     * Evicts least recently used entries if cache is full
     * @param user_id - User ID
     * @param profile - User profile data
     */
    set(user_id, profile) {
        // Evict LRU entries if cache is full
        while (this.cache.size >= this.max_size) {
            const first_key = this.cache.keys().next().value;
            if (first_key) {
                this.cache.delete(first_key);
            }
            else {
                break;
            }
        }
        const entry = {
            profile,
            timestamp: Date.now(),
        };
        this.cache.set(user_id, entry);
    }
    /**
     * Sets multiple cache entries at once
     * @param profiles - Array of user profiles to cache
     */
    set_many(profiles) {
        for (const profile of profiles) {
            this.set(profile.user_id, profile);
        }
    }
    /**
     * Invalidates cache for a specific user
     * @param user_id - User ID to invalidate
     */
    invalidate_user(user_id) {
        this.cache.delete(user_id);
    }
    /**
     * Invalidates cache for multiple users
     * @param user_ids - Array of user IDs to invalidate
     */
    invalidate_users(user_ids) {
        for (const user_id of user_ids) {
            this.cache.delete(user_id);
        }
    }
    /**
     * Invalidates all cache entries
     */
    invalidate_all() {
        this.cache.clear();
    }
    /**
     * Gets cache statistics
     * @returns Object with cache size and max size
     */
    get_stats() {
        return {
            size: this.cache.size,
            max_size: this.max_size,
            ttl_minutes: this.ttl_ms / 60000,
        };
    }
}
// section: singleton
// Global cache instance (initialized with defaults, will be configured on first use)
let user_profiles_cache_instance = null;
/**
 * Gets or creates the global user profiles cache instance
 * @param max_size - Maximum cache size (default: 5000)
 * @param ttl_minutes - TTL in minutes (default: 5)
 * @returns User profiles cache instance
 */
export function get_user_profiles_cache(max_size = 5000, ttl_minutes = 5) {
    if (!user_profiles_cache_instance) {
        user_profiles_cache_instance = new UserProfilesCache(max_size, ttl_minutes);
    }
    return user_profiles_cache_instance;
}
/**
 * Resets the global cache instance (useful for testing)
 */
export function reset_user_profiles_cache() {
    user_profiles_cache_instance = null;
}
