// file_description: Simple in-memory rate limiter for hazo_get_auth API endpoint
// section: types
/**
 * Simple in-memory rate limiter
 * Tracks request counts per key within a time window
 */
class RateLimiter {
    constructor() {
        this.limits = new Map();
        this.window_ms = 60 * 1000; // 1 minute window
    }
    /**
     * Checks if a request should be allowed
     * @param key - Rate limit key (e.g., "user:123" or "ip:192.168.1.1")
     * @param max_requests - Maximum requests allowed per window
     * @returns true if allowed, false if rate limited
     */
    check(key, max_requests) {
        const now = Date.now();
        const entry = this.limits.get(key);
        if (!entry) {
            // First request for this key
            this.limits.set(key, {
                count: 1,
                window_start: now,
            });
            return true;
        }
        // Check if window has expired
        if (now - entry.window_start >= this.window_ms) {
            // Reset window
            this.limits.set(key, {
                count: 1,
                window_start: now,
            });
            return true;
        }
        // Check if limit exceeded
        if (entry.count >= max_requests) {
            return false;
        }
        // Increment count
        entry.count++;
        return true;
    }
    /**
     * Cleans up old entries (call periodically to prevent memory leak)
     * Removes entries older than 2 windows
     */
    cleanup() {
        const now = Date.now();
        const cutoff = now - 2 * this.window_ms;
        const keys_to_delete = [];
        for (const [key, entry] of this.limits.entries()) {
            if (entry.window_start < cutoff) {
                keys_to_delete.push(key);
            }
        }
        for (const key of keys_to_delete) {
            this.limits.delete(key);
        }
    }
    /**
     * Gets rate limit statistics
     * @returns Object with current limit entries count
     */
    get_stats() {
        return {
            active_limits: this.limits.size,
        };
    }
}
// section: singleton
// Global rate limiter instance
let rate_limiter_instance = null;
/**
 * Gets or creates the global rate limiter instance
 * @returns Rate limiter instance
 */
export function get_rate_limiter() {
    if (!rate_limiter_instance) {
        rate_limiter_instance = new RateLimiter();
        // Cleanup old entries every 5 minutes
        setInterval(() => {
            rate_limiter_instance === null || rate_limiter_instance === void 0 ? void 0 : rate_limiter_instance.cleanup();
        }, 5 * 60 * 1000);
    }
    return rate_limiter_instance;
}
/**
 * Resets the global rate limiter instance (useful for testing)
 */
export function reset_rate_limiter() {
    rate_limiter_instance = null;
}
