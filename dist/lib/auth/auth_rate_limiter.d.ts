/**
 * Simple in-memory rate limiter
 * Tracks request counts per key within a time window
 */
declare class RateLimiter {
    private limits;
    private window_ms;
    constructor();
    /**
     * Checks if a request should be allowed
     * @param key - Rate limit key (e.g., "user:123" or "ip:192.168.1.1")
     * @param max_requests - Maximum requests allowed per window
     * @returns true if allowed, false if rate limited
     */
    check(key: string, max_requests: number): boolean;
    /**
     * Cleans up old entries (call periodically to prevent memory leak)
     * Removes entries older than 2 windows
     */
    cleanup(): void;
    /**
     * Gets rate limit statistics
     * @returns Object with current limit entries count
     */
    get_stats(): {
        active_limits: number;
    };
}
/**
 * Gets or creates the global rate limiter instance
 * @returns Rate limiter instance
 */
export declare function get_rate_limiter(): RateLimiter;
/**
 * Resets the global rate limiter instance (useful for testing)
 */
export declare function reset_rate_limiter(): void;
export {};
//# sourceMappingURL=auth_rate_limiter.d.ts.map