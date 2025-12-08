/**
 * LRU cache implementation for user scope lookups
 * Uses Map to maintain insertion order for LRU eviction
 */
class ScopeCache {
    constructor(max_size, ttl_minutes) {
        this.cache = new Map();
        this.max_size = max_size;
        this.ttl_ms = ttl_minutes * 60 * 1000;
        this.scope_version_map = new Map();
    }
    /**
     * Gets a cache entry for a user's scopes
     * Returns undefined if not found or expired
     * @param user_id - User ID to look up
     * @returns Cache entry or undefined
     */
    get(user_id) {
        const entry = this.cache.get(user_id);
        if (!entry) {
            return undefined;
        }
        const now = Date.now();
        const age = now - entry.timestamp;
        // Check if entry is expired (TTL)
        if (age > this.ttl_ms) {
            this.cache.delete(user_id);
            return undefined;
        }
        // Check if any of user's scopes have been invalidated
        const max_scope_version = this.get_max_scope_version(entry.scopes);
        if (max_scope_version > entry.cache_version) {
            this.cache.delete(user_id);
            return undefined;
        }
        // Move to end (most recently used)
        this.cache.delete(user_id);
        this.cache.set(user_id, entry);
        return entry;
    }
    /**
     * Sets a cache entry for a user's scopes
     * Evicts least recently used entries if cache is full
     * @param user_id - User ID
     * @param scopes - User's scope assignments
     */
    set(user_id, scopes) {
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
        // Get current cache version for user's scopes
        const cache_version = this.get_max_scope_version(scopes);
        const entry = {
            user_id,
            scopes,
            timestamp: Date.now(),
            cache_version,
        };
        this.cache.set(user_id, entry);
    }
    /**
     * Invalidates cache for a specific user
     * @param user_id - User ID to invalidate
     */
    invalidate_user(user_id) {
        this.cache.delete(user_id);
    }
    /**
     * Invalidates cache for all users with a specific scope
     * Uses cache version to determine if invalidation is needed
     * @param scope_type - Scope level
     * @param scope_id - Scope ID to invalidate
     */
    invalidate_by_scope(scope_type, scope_id) {
        const scope_key = `${scope_type}:${scope_id}`;
        const current_version = this.scope_version_map.get(scope_key) || 0;
        this.scope_version_map.set(scope_key, current_version + 1);
        // Remove entries where cache version is older than scope version
        const entries_to_remove = [];
        for (const [user_id, entry] of this.cache.entries()) {
            // Check if user has this scope
            const has_scope = entry.scopes.some((s) => s.scope_type === scope_type && s.scope_id === scope_id);
            if (has_scope) {
                entries_to_remove.push(user_id);
            }
        }
        for (const user_id of entries_to_remove) {
            this.cache.delete(user_id);
        }
    }
    /**
     * Invalidates cache for all users with any scope of a specific level
     * @param scope_type - Scope level to invalidate
     */
    invalidate_by_scope_level(scope_type) {
        const entries_to_remove = [];
        for (const [user_id, entry] of this.cache.entries()) {
            // Check if user has any scope of this level
            const has_level = entry.scopes.some((s) => s.scope_type === scope_type);
            if (has_level) {
                entries_to_remove.push(user_id);
            }
        }
        for (const user_id of entries_to_remove) {
            this.cache.delete(user_id);
        }
    }
    /**
     * Invalidates all cache entries
     */
    invalidate_all() {
        this.cache.clear();
        this.scope_version_map.clear();
    }
    /**
     * Gets the maximum cache version for a set of scopes
     * Used to determine if cache entry is stale
     * @param scopes - Array of scope entries
     * @returns Maximum version number
     */
    get_max_scope_version(scopes) {
        if (scopes.length === 0) {
            return 0;
        }
        let max_version = 0;
        for (const scope of scopes) {
            const scope_key = `${scope.scope_type}:${scope.scope_id}`;
            const version = this.scope_version_map.get(scope_key) || 0;
            max_version = Math.max(max_version, version);
        }
        return max_version;
    }
    /**
     * Gets cache statistics
     * @returns Object with cache size and max size
     */
    get_stats() {
        return {
            size: this.cache.size,
            max_size: this.max_size,
        };
    }
}
// section: singleton
// Global scope cache instance (initialized with defaults, will be configured on first use)
let scope_cache_instance = null;
/**
 * Gets or creates the global scope cache instance
 * @param max_size - Maximum cache size (default: 5000)
 * @param ttl_minutes - TTL in minutes (default: 15)
 * @returns Scope cache instance
 */
export function get_scope_cache(max_size = 5000, ttl_minutes = 15) {
    if (!scope_cache_instance) {
        scope_cache_instance = new ScopeCache(max_size, ttl_minutes);
    }
    return scope_cache_instance;
}
/**
 * Resets the global scope cache instance (useful for testing)
 */
export function reset_scope_cache() {
    scope_cache_instance = null;
}
