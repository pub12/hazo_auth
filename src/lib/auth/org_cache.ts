// file_description: LRU cache implementation for organization lookups with TTL and size limits
// section: types

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
 * Internal cache entry with metadata
 */
type CacheItem = {
  entry: OrgCacheEntry;
  timestamp: number; // Unix timestamp in milliseconds
};

/**
 * LRU cache implementation for organization lookups
 * Uses Map to maintain insertion order for LRU eviction
 */
class OrgCache {
  private cache: Map<string, CacheItem>;
  private max_size: number;
  private ttl_ms: number;

  constructor(max_size: number, ttl_minutes: number) {
    this.cache = new Map();
    this.max_size = max_size;
    this.ttl_ms = ttl_minutes * 60 * 1000;
  }

  /**
   * Gets a cache entry for an organization
   * Returns undefined if not found or expired
   * @param org_id - Organization ID to look up
   * @returns Cache entry or undefined
   */
  get(org_id: string): OrgCacheEntry | undefined {
    const item = this.cache.get(org_id);

    if (!item) {
      return undefined;
    }

    const now = Date.now();
    const age = now - item.timestamp;

    // Check if entry is expired (TTL)
    if (age > this.ttl_ms) {
      this.cache.delete(org_id);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(org_id);
    this.cache.set(org_id, item);

    return item.entry;
  }

  /**
   * Sets a cache entry for an organization
   * Evicts least recently used entries if cache is full
   * @param org_id - Organization ID
   * @param entry - Organization cache entry
   */
  set(org_id: string, entry: OrgCacheEntry): void {
    // Evict LRU entries if cache is full
    while (this.cache.size >= this.max_size) {
      const first_key = this.cache.keys().next().value;
      if (first_key) {
        this.cache.delete(first_key);
      } else {
        break;
      }
    }

    const item: CacheItem = {
      entry,
      timestamp: Date.now(),
    };

    this.cache.set(org_id, item);
  }

  /**
   * Invalidates cache for a specific organization
   * @param org_id - Organization ID to invalidate
   */
  invalidate(org_id: string): void {
    this.cache.delete(org_id);
  }

  /**
   * Invalidates all cache entries
   */
  invalidate_all(): void {
    this.cache.clear();
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
// Global org cache instance (initialized with defaults, will be configured on first use)
let org_cache_instance: OrgCache | null = null;

/**
 * Gets or creates the global org cache instance
 * @param max_size - Maximum cache size (default: 1000)
 * @param ttl_minutes - TTL in minutes (default: 15)
 * @returns Org cache instance
 */
export function get_org_cache(
  max_size: number = 1000,
  ttl_minutes: number = 15,
): OrgCache {
  if (!org_cache_instance) {
    org_cache_instance = new OrgCache(max_size, ttl_minutes);
  }
  return org_cache_instance;
}

/**
 * Resets the global org cache instance (useful for testing)
 */
export function reset_org_cache(): void {
  org_cache_instance = null;
}
