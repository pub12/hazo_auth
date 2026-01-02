// file_description: LRU cache implementation for hazo_get_auth with TTL and size limits
// section: imports
import type { HazoAuthUser } from "./auth_types";

// section: types

/**
 * Cache entry structure
 * v5.x: role_ids are now string UUIDs (from hazo_user_scopes)
 */
type CacheEntry = {
  user: HazoAuthUser;
  permissions: string[];
  role_ids: string[];
  timestamp: number; // Unix timestamp in milliseconds
  cache_version: number; // Version number for smart invalidation
};

/**
 * LRU cache implementation with TTL and size limits
 * Uses Map to maintain insertion order for LRU eviction
 */
class AuthCache {
  private cache: Map<string, CacheEntry>;
  private max_size: number;
  private ttl_ms: number;
  private max_age_ms: number;
  private role_version_map: Map<string, number>; // Track version per role for smart invalidation (v5.x: string UUIDs)

  constructor(
    max_size: number,
    ttl_minutes: number,
    max_age_minutes: number,
  ) {
    this.cache = new Map();
    this.max_size = max_size;
    this.ttl_ms = ttl_minutes * 60 * 1000;
    this.max_age_ms = max_age_minutes * 60 * 1000;
    this.role_version_map = new Map();
  }

  /**
   * Gets a cache entry for a user
   * Returns undefined if not found, expired, or too old
   * @param user_id - User ID to look up
   * @returns Cache entry or undefined
   */
  get(user_id: string): CacheEntry | undefined {
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

    // Check if entry is too old (force refresh threshold)
    if (age > this.max_age_ms) {
      // Don't delete, but mark as stale so caller can refresh
      // Return undefined to force refresh
      this.cache.delete(user_id);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(user_id);
    this.cache.set(user_id, entry);

    return entry;
  }

  /**
   * Sets a cache entry for a user
   * Evicts least recently used entries if cache is full
   * @param user_id - User ID
   * @param user - User data
   * @param permissions - User permissions
   * @param role_ids - User role IDs (v5.x: string UUIDs)
   */
  set(
    user_id: string,
    user: HazoAuthUser,
    permissions: string[],
    role_ids: string[],
  ): void {
    // Evict LRU entries if cache is full
    while (this.cache.size >= this.max_size) {
      const first_key = this.cache.keys().next().value;
      if (first_key) {
        this.cache.delete(first_key);
      } else {
        break;
      }
    }

    // Get current cache version for user's roles
    const cache_version = this.get_max_role_version(role_ids);

    const entry: CacheEntry = {
      user,
      permissions,
      role_ids,
      timestamp: Date.now(),
      cache_version,
    };

    this.cache.set(user_id, entry);
  }

  /**
   * Invalidates cache for a specific user
   * @param user_id - User ID to invalidate
   */
  invalidate_user(user_id: string): void {
    this.cache.delete(user_id);
  }

  /**
   * Invalidates cache for all users with specific roles
   * Uses cache version to determine if invalidation is needed
   * @param role_ids - Array of role IDs to invalidate (v5.x: string UUIDs)
   */
  invalidate_by_roles(role_ids: string[]): void {
    // Increment version for affected roles
    for (const role_id of role_ids) {
      const current_version = this.role_version_map.get(role_id) || 0;
      this.role_version_map.set(role_id, current_version + 1);
    }

    // Remove entries where cache version is older than role version
    const entries_to_remove: string[] = [];
    for (const [user_id, entry] of this.cache.entries()) {
      const max_role_version = this.get_max_role_version(entry.role_ids);
      if (max_role_version > entry.cache_version) {
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
  invalidate_all(): void {
    this.cache.clear();
  }

  /**
   * Gets the maximum cache version for a set of roles
   * Used to determine if cache entry is stale
   * @param role_ids - Array of role IDs (v5.x: string UUIDs)
   * @returns Maximum version number
   */
  private get_max_role_version(role_ids: string[]): number {
    if (role_ids.length === 0) {
      return 0;
    }

    let max_version = 0;
    for (const role_id of role_ids) {
      const version = this.role_version_map.get(role_id) || 0;
      max_version = Math.max(max_version, version);
    }

    return max_version;
  }

  /**
   * Gets cache statistics
   * @returns Object with cache size, max size, and hit rate estimate
   */
  get_stats(): {
    size: number;
    max_size: number;
  } {
    return {
      size: this.cache.size,
      max_size: this.max_size,
    };
  }
}

// section: singleton
// Global cache instance (initialized with defaults, will be configured on first use)
let auth_cache_instance: AuthCache | null = null;

/**
 * Gets or creates the global auth cache instance
 * @param max_size - Maximum cache size (default: 10000)
 * @param ttl_minutes - TTL in minutes (default: 15)
 * @param max_age_minutes - Max age in minutes (default: 30)
 * @returns Auth cache instance
 */
export function get_auth_cache(
  max_size: number = 10000,
  ttl_minutes: number = 15,
  max_age_minutes: number = 30,
): AuthCache {
  if (!auth_cache_instance) {
    auth_cache_instance = new AuthCache(max_size, ttl_minutes, max_age_minutes);
  }
  return auth_cache_instance;
}

/**
 * Resets the global cache instance (useful for testing)
 */
export function reset_auth_cache(): void {
  auth_cache_instance = null;
}

