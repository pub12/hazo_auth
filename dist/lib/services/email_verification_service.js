import { createCrudService } from "hazo_connect/server";
import argon2 from "argon2";
import { create_token } from "./token_service";
import { send_template_email } from "./email_service";
import { create_app_logger } from "../app_logger";
// section: helpers
/**
 * Verifies an email verification token
 * Updates email_verified to true in hazo_users and deletes the token
 * @param adapter - The hazo_connect adapter instance
 * @param data - Email verification token data (token)
 * @returns Email verification result with success status, user_id, email, or error
 */
export async function verify_email_token(adapter, data) {
    try {
        const { token } = data;
        // Create CRUD service for hazo_refresh_tokens table
        const tokens_service = createCrudService(adapter, "hazo_refresh_tokens");
        // Find all email verification tokens
        // If token_type column doesn't exist, query all tokens and filter manually
        let all_tokens = [];
        try {
            all_tokens = (await tokens_service.findBy({
                token_type: "email_verification",
            }));
        }
        catch (error) {
            // If token_type column doesn't exist, get all tokens and we'll verify each one
            const logger = create_app_logger();
            const error_message = error instanceof Error ? error.message : "Unknown error";
            logger.warn("email_verification_service_token_type_column_missing", {
                filename: "email_verification_service.ts",
                line_number: 0,
                error: error_message,
                note: "token_type column may not exist, querying all tokens",
            });
            try {
                // Query all tokens (will need to verify each one)
                all_tokens = (await tokens_service.findBy({}));
            }
            catch (fallbackError) {
                const fallback_error_message = fallbackError instanceof Error ? fallbackError.message : "Unknown error";
                logger.error("email_verification_service_query_tokens_failed", {
                    filename: "email_verification_service.ts",
                    line_number: 0,
                    error: fallback_error_message,
                });
                return {
                    success: false,
                    error: "Invalid or expired verification token",
                };
            }
        }
        if (!Array.isArray(all_tokens) || all_tokens.length === 0) {
            return {
                success: false,
                error: "Invalid or expired verification token",
            };
        }
        // Find the matching token by verifying the hash
        let matching_token = null;
        let user_id = null;
        for (const stored_token of all_tokens) {
            try {
                const token_hash = stored_token.token_hash;
                const is_valid = await argon2.verify(token_hash, token);
                if (is_valid) {
                    matching_token = stored_token;
                    user_id = stored_token.user_id;
                    break;
                }
            }
            catch (_a) {
                // Continue to next token if verification fails
                continue;
            }
        }
        if (!matching_token || !user_id) {
            return {
                success: false,
                error: "Invalid or expired verification token",
            };
        }
        // Check if token has expired
        const expires_at = new Date(matching_token.expires_at);
        const now = new Date();
        if (expires_at < now) {
            // Delete expired token
            await tokens_service.deleteById(matching_token.id);
            return {
                success: false,
                error: "Verification token has expired",
            };
        }
        // Get user email before updating
        const users_service = createCrudService(adapter, "hazo_users");
        const users = await users_service.findBy({
            id: user_id,
        });
        if (!Array.isArray(users) || users.length === 0) {
            return {
                success: false,
                error: "User not found",
            };
        }
        const user = users[0];
        const email = user.email_address;
        // Update user's email_verified status
        const now_iso = new Date().toISOString();
        await users_service.updateById(user_id, {
            email_verified: true,
            changed_at: now_iso,
        });
        // Delete the used token
        await tokens_service.deleteById(matching_token.id);
        return {
            success: true,
            user_id,
            email,
        };
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            error: error_message,
        };
    }
}
/**
 * Resends an email verification token for a user
 * Creates a new email verification token and stores it in hazo_refresh_tokens
 * Invalidates any existing email verification tokens for the user before creating a new one
 * @param adapter - The hazo_connect adapter instance
 * @param data - Resend verification data (email)
 * @returns Resend verification result with success status or error
 */
export async function resend_verification_email(adapter, data) {
    try {
        const { email } = data;
        // Create CRUD service for hazo_users table
        const users_service = createCrudService(adapter, "hazo_users");
        // Find user by email
        const users = await users_service.findBy({
            email_address: email,
        });
        // If user not found, return success anyway (to prevent email enumeration)
        if (!Array.isArray(users) || users.length === 0) {
            return {
                success: true,
            };
        }
        const user = users[0];
        const user_id = user.id;
        // Check if email is already verified
        if (user.email_verified === true) {
            return {
                success: true,
            };
        }
        // Create email verification token using shared token service
        const token_result = await create_token({
            adapter,
            user_id,
            token_type: "email_verification",
        });
        if (!token_result.success) {
            return {
                success: false,
                error: token_result.error || "Failed to create email verification token",
            };
        }
        // Send verification email if token was created successfully
        if (token_result.raw_token) {
            const email_result = await send_template_email("email_verification", email, {
                token: token_result.raw_token,
                user_email: email,
                user_name: user.name,
            });
            if (!email_result.success) {
                const logger = create_app_logger();
                logger.error("email_verification_service_email_send_failed", {
                    filename: "email_verification_service.ts",
                    line_number: 0,
                    user_id,
                    email,
                    error: email_result.error,
                    note: "Verification token created but email failed to send",
                });
                // Return error if email sending failed (this is a technical error, not a security issue)
                return {
                    success: false,
                    error: email_result.error || "Failed to send verification email",
                };
            }
        }
        return {
            success: true,
        };
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            error: error_message,
        };
    }
}
