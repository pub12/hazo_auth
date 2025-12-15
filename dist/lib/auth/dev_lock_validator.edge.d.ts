import type { NextRequest } from "next/server";
export type DevLockValidationResult = {
    valid: boolean;
    expired?: boolean;
};
export type DevLockCookieData = {
    value: string;
    max_age: number;
};
/**
 * Creates a signed dev lock cookie value
 * Cookie format: timestamp|expiry_timestamp|signature
 * @param password - The dev lock password (used as signing key)
 * @param expiry_days - Number of days until cookie expires (default: 7)
 * @returns Cookie value and max_age in seconds
 */
export declare function create_dev_lock_cookie(password: string, expiry_days?: number): Promise<DevLockCookieData>;
/**
 * Validates dev lock cookie from request (Edge-compatible)
 * Checks signature validity and expiration
 * @param request - NextRequest object
 * @returns Validation result with valid flag and optional expired flag
 */
export declare function validate_dev_lock_cookie(request: NextRequest): Promise<DevLockValidationResult>;
/**
 * Validates password against environment variable (for unlock endpoint)
 * Uses constant-time comparison to prevent timing attacks
 * @param password - Password to validate
 * @returns true if password matches
 */
export declare function validate_dev_lock_password(password: string): boolean;
/**
 * Gets the dev lock cookie name
 * Exported for use in API routes when setting the cookie
 * @returns Cookie name string
 */
export declare function get_dev_lock_cookie_name(): string;
//# sourceMappingURL=dev_lock_validator.edge.d.ts.map