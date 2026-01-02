// file_description: service for creating and validating JWT session tokens for authentication
// Uses jose library for Edge-compatible JWT operations
// section: imports
import { SignJWT, jwtVerify } from "jose";
import { create_app_logger } from "../app_logger.js";
import { get_filename, get_line_number } from "../utils/api_route_helpers.js";
// section: helpers
/**
 * Gets JWT secret from environment variables
 * @returns JWT secret as Uint8Array for jose library
 * @throws Error if JWT_SECRET is not set
 */
function get_jwt_secret() {
    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) {
        const logger = create_app_logger();
        logger.error("session_token_jwt_secret_missing", {
            filename: get_filename(),
            line_number: get_line_number(),
            error: "JWT_SECRET environment variable is required",
        });
        throw new Error("JWT_SECRET environment variable is required");
    }
    // Convert string secret to Uint8Array for jose
    return new TextEncoder().encode(jwt_secret);
}
/**
 * Gets session token expiry in seconds (default: 30 days)
 * @returns Number of seconds until token expires
 */
function get_session_token_expiry_seconds() {
    // Default: 30 days = 30 * 24 * 60 * 60 = 2,592,000 seconds
    const default_expiry_seconds = 60 * 60 * 24 * 30;
    // Could be extended to read from config in the future
    // For now, use default 30 days to match cookie expiry
    return default_expiry_seconds;
}
// section: main_functions
/**
 * Creates a JWT session token for a user
 * Token includes user_id, email, issued at time, and expiration
 * @param user_id - User ID
 * @param email - User email address
 * @returns JWT token string
 */
export async function create_session_token(user_id, email) {
    const logger = create_app_logger();
    try {
        const secret = get_jwt_secret();
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        const expiry_seconds = get_session_token_expiry_seconds();
        const exp = now + expiry_seconds;
        const jwt = await new SignJWT({
            user_id,
            email,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt(now)
            .setExpirationTime(exp)
            .sign(secret);
        logger.info("session_token_created", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id,
            email,
            expires_in_seconds: expiry_seconds,
        });
        return jwt;
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("session_token_creation_failed", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id,
            email,
            error_message,
            error_stack,
        });
        throw new Error("Failed to create session token");
    }
}
/**
 * Validates a JWT session token
 * Checks signature and expiration
 * @param token - JWT token string
 * @returns Validation result with user_id and email if valid
 */
export async function validate_session_token(token) {
    const logger = create_app_logger();
    try {
        const secret = get_jwt_secret();
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ["HS256"],
        });
        // Extract user_id and email from payload
        const user_id = payload.user_id;
        const email = payload.email;
        if (!user_id || !email) {
            logger.warn("session_token_invalid_payload", {
                filename: get_filename(),
                line_number: get_line_number(),
                error: "Token payload missing user_id or email",
            });
            return { valid: false };
        }
        logger.info("session_token_validated", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id,
            email,
        });
        return {
            valid: true,
            user_id,
            email,
        };
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        // jose throws JWTExpired, JWTInvalid, etc. - these are expected for invalid tokens
        logger.debug("session_token_validation_failed", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
        });
        return { valid: false };
    }
}
