// file_description: LRU cache implementation for scope lookups with TTL and size limits
// section: types

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
  timestamp: number; // Unix timestamp in milliseconds
  cache_version: number; // Version number for smart invalidation
};

/**
 * LRU cache implementation for user scope lookups
 * Uses Map to maintain insertion order for LRU eviction
 */
class ScopeCache {
  private cache: Map<string, ScopeCacheEntry>;
  private max_size: number;
  private ttl_ms: number;
  private scope_version_map: Map<string, number>; // Track version per scope for smart invalidation

  constructor(max_size: number, ttl_minutes: number) {
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
  get(user_id: string): ScopeCacheEntry | undefined {
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
  set(user_id: string, scopes: UserScopeEntry[]): void {
    // Evict LRU entries if cache is full
    while (this.cache.size >= this.max_size) {
      const first_key = this.cache.keys().next().value;
      if (first_key) {
        this.cache.delete(first_key);
      } else {
        break;
      }
    }

    // Get current cache version for user's scopes
    const cache_version = this.get_max_scope_version(scopes);

    const entry: ScopeCacheEntry = {
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
  invalidate_user(user_id: string): void {
    this.cache.delete(user_id);
  }

  /**
   * Invalidates cache for all users with a specific scope
   * Uses cache version to determine if invalidation is needed
   * @param scope_id - Scope ID to invalidate
   */
  invalidate_by_scope(scope_id: string): void {
    const current_version = this.scope_version_map.get(scope_id) || 0;
    this.scope_version_map.set(scope_id, current_version + 1);

    // Remove entries where cache version is older than scope version
    const entries_to_remove: string[] = [];
    for (const [user_id, entry] of this.cache.entries()) {
      // Check if user has this scope
      const has_scope = entry.scopes.some((s) => s.scope_id === scope_id);
      if (has_scope) {
        entries_to_remove.push(user_id);
      }
    }

    for (const user_id of entries_to_remove) {
      this.cache.delete(user_id);
    }
  }

  /**
   * Invalidates cache for all users with any scope in a specific root scope tree
   * @param root_scope_id - Root scope ID to invalidate
   */
  invalidate_by_root_scope(root_scope_id: string): void {
    const entries_to_remove: string[] = [];
    for (const [user_id, entry] of this.cache.entries()) {
      // Check if user has any scope in this root tree
      const has_root = entry.scopes.some((s) => s.root_scope_id === root_scope_id);
      if (has_root) {
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
    this.scope_version_map.clear();
  }

  /**
   * Gets the maximum cache version for a set of scopes
   * Used to determine if cache entry is stale
   * @param scopes - Array of scope entries
   * @returns Maximum version number
   */
  private get_max_scope_version(scopes: UserScopeEntry[]): number {
    if (scopes.length === 0) {
      return 0;
    }

    let max_version = 0;
    for (const scope of scopes) {
      const version = this.scope_version_map.get(scope.scope_id) || 0;
      max_version = Math.max(max_version, version);
    }

    return max_version;
  }

  /**
   * Gets cache statistics
   * @returns Object with cache size and max size
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
// Global scope cache instance (initialized with defaults, will be configured on first use)
let scope_cache_instance: ScopeCache | null = null;

/**
 * Gets or creates the global scope cache instance
 * @param max_size - Maximum cache size (default: 5000)
 * @param ttl_minutes - TTL in minutes (default: 15)
 * @returns Scope cache instance
 */
export function get_scope_cache(
  max_size: number = 5000,
  ttl_minutes: number = 15,
): ScopeCache {
  if (!scope_cache_instance) {
    scope_cache_instance = new ScopeCache(max_size, ttl_minutes);
  }
  return scope_cache_instance;
}

/**
 * Resets the global scope cache instance (useful for testing)
 */
export function reset_scope_cache(): void {
  scope_cache_instance = null;
}
