// file_description: Edge-compatible dev lock cookie validator for Next.js middleware
// Uses Web Crypto API which works in Edge Runtime (no Node.js crypto module)
// section: imports
import type { NextRequest } from "next/server";

// section: constants
const COOKIE_NAME = "hazo_auth_dev_lock";
const SEPARATOR = "|";

// section: types
export type DevLockValidationResult = {
  valid: boolean;
  expired?: boolean;
};

export type DevLockCookieData = {
  value: string;
  max_age: number;
};

// section: helpers
/**
 * Creates HMAC-SHA256 signature using Web Crypto API (Edge compatible)
 * @param data - Data to sign
 * @param secret - Secret key for signing
 * @returns Hex string signature
 */
async function create_signature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key_data = encoder.encode(secret);
  const message_data = encoder.encode(data);

  const crypto_key = await crypto.subtle.importKey(
    "raw",
    key_data,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", crypto_key, message_data);

  // Convert ArrayBuffer to hex string
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Performs constant-time comparison of two strings
 * Prevents timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
function constant_time_compare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// section: main_functions
/**
 * Creates a signed dev lock cookie value
 * Cookie format: timestamp|expiry_timestamp|signature
 * @param password - The dev lock password (used as signing key)
 * @param expiry_days - Number of days until cookie expires (default: 7)
 * @returns Cookie value and max_age in seconds
 */
export async function create_dev_lock_cookie(
  password: string,
  expiry_days: number = 7
): Promise<DevLockCookieData> {
  const timestamp = Date.now();
  const expiry_timestamp = timestamp + expiry_days * 24 * 60 * 60 * 1000;
  const data = `${timestamp}${SEPARATOR}${expiry_timestamp}`;
  const signature = await create_signature(data, password);

  return {
    value: `${data}${SEPARATOR}${signature}`,
    max_age: expiry_days * 24 * 60 * 60, // in seconds
  };
}

/**
 * Validates dev lock cookie from request (Edge-compatible)
 * Checks signature validity and expiration
 * @param request - NextRequest object
 * @returns Validation result with valid flag and optional expired flag
 */
export async function validate_dev_lock_cookie(
  request: NextRequest
): Promise<DevLockValidationResult> {
  const password = process.env.HAZO_AUTH_DEV_LOCK_PASSWORD;

  if (!password) {
    // No password set - cannot validate
    return { valid: false };
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;

  if (!cookie) {
    return { valid: false };
  }

  try {
    const parts = cookie.split(SEPARATOR);
    if (parts.length !== 3) {
      return { valid: false };
    }

    const [timestamp_str, expiry_str, signature] = parts;
    const timestamp = parseInt(timestamp_str, 10);
    const expiry_timestamp = parseInt(expiry_str, 10);

    if (isNaN(timestamp) || isNaN(expiry_timestamp)) {
      return { valid: false };
    }

    // Check expiry
    if (Date.now() > expiry_timestamp) {
      return { valid: false, expired: true };
    }

    // Verify signature
    const data = `${timestamp}${SEPARATOR}${expiry_timestamp}`;
    const expected_signature = await create_signature(data, password);

    // Constant-time comparison to prevent timing attacks
    if (!constant_time_compare(signature, expected_signature)) {
      return { valid: false };
    }

    return { valid: true };
  } catch {
    return { valid: false };
  }
}

/**
 * Validates password against environment variable (for unlock endpoint)
 * Uses constant-time comparison to prevent timing attacks
 * @param password - Password to validate
 * @returns true if password matches
 */
export function validate_dev_lock_password(password: string): boolean {
  const expected = process.env.HAZO_AUTH_DEV_LOCK_PASSWORD;

  if (!expected || !password) {
    return false;
  }

  return constant_time_compare(password, expected);
}

/**
 * Gets the dev lock cookie name
 * Exported for use in API routes when setting the cookie
 * @returns Cookie name string
 */
export function get_dev_lock_cookie_name(): string {
  return COOKIE_NAME;
}
