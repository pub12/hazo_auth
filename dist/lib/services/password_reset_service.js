import { createCrudService } from "hazo_connect/server";
import { create_token } from "hazo_auth/lib/services/token_service";
import argon2 from "argon2";
import { create_app_logger } from "hazo_auth/lib/app_logger";
import { send_template_email } from "hazo_auth/lib/services/email_service";
// section: helpers
/**
 * Requests a password reset for a user by email
 * Generates a secure token, hashes it, and stores it in hazo_refresh_tokens with token_type = 'password_reset'
 * Invalidates any existing password reset tokens for the user before creating a new one
 * @param adapter - The hazo_connect adapter instance
 * @param data - Password reset request data (email)
 * @returns Password reset request result with success status or error
 */
export async function request_password_reset(adapter, data) {
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
        // Create password reset token using shared token service
        const token_result = await create_token({
            adapter,
            user_id,
            token_type: "password_reset",
        });
        if (!token_result.success) {
            return {
                success: false,
                error: token_result.error || "Failed to create password reset token",
            };
        }
        // Send password reset email if token was created successfully
        if (token_result.raw_token) {
            const email_result = await send_template_email("forgot_password", email, {
                token: token_result.raw_token,
                user_email: email,
                user_name: user.name,
            });
            if (!email_result.success) {
                const logger = create_app_logger();
                logger.error("password_reset_service_email_send_failed", {
                    filename: "password_reset_service.ts",
                    line_number: 0,
                    user_id,
                    email,
                    error: email_result.error,
                    note: "Password reset token created but email failed to send",
                });
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
/**
 * Validates a password reset token without resetting the password
 * Verifies the token exists and checks if it has expired
 * @param adapter - The hazo_connect adapter instance
 * @param data - Token validation data (token)
 * @returns Token validation result with success status or error
 */
export async function validate_password_reset_token(adapter, data) {
    try {
        const { token } = data;
        // Create CRUD service for hazo_refresh_tokens table
        const tokens_service = createCrudService(adapter, "hazo_refresh_tokens");
        // Find all password reset tokens
        // If token_type column doesn't exist, query all tokens and filter manually
        let all_tokens = [];
        try {
            all_tokens = (await tokens_service.findBy({
                token_type: "password_reset",
            }));
        }
        catch (error) {
            // If token_type column doesn't exist, get all tokens and we'll verify each one
            const logger = create_app_logger();
            const error_message = error instanceof Error ? error.message : "Unknown error";
            logger.warn("password_reset_service_token_type_column_missing", {
                filename: "password_reset_service.ts",
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
                logger.error("password_reset_service_query_tokens_failed", {
                    filename: "password_reset_service.ts",
                    line_number: 0,
                    error: fallback_error_message,
                });
                return {
                    success: false,
                    error: "Invalid or expired reset token",
                };
            }
        }
        if (!Array.isArray(all_tokens) || all_tokens.length === 0) {
            return {
                success: false,
                error: "Invalid or expired reset token",
            };
        }
        // Find the matching token by verifying the hash
        let matching_token = null;
        for (const stored_token of all_tokens) {
            try {
                const token_hash = stored_token.token_hash;
                const is_valid = await argon2.verify(token_hash, token);
                if (is_valid) {
                    matching_token = stored_token;
                    break;
                }
            }
            catch (_a) {
                // Continue to next token if verification fails
                continue;
            }
        }
        if (!matching_token) {
            return {
                success: false,
                error: "Invalid or expired reset token",
            };
        }
        // Check if token has expired
        const expires_at = new Date(matching_token.expires_at);
        const now = new Date();
        if (expires_at < now) {
            return {
                success: false,
                error: "Reset token has expired",
            };
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
/**
 * Resets a user's password using a password reset token
 * Verifies the token, checks expiration, updates password, and deletes the token
 * @param adapter - The hazo_connect adapter instance
 * @param data - Password reset data (token, new_password)
 * @returns Password reset result with success status, user_id, email, or error
 */
export async function reset_password(adapter, data) {
    try {
        const { token, new_password, minimum_length = 8 } = data;
        // Validate password
        if (!new_password || new_password.length < minimum_length) {
            return {
                success: false,
                error: `Password must be at least ${minimum_length} character${minimum_length === 1 ? "" : "s"} long`,
            };
        }
        // Create CRUD service for hazo_refresh_tokens table
        const tokens_service = createCrudService(adapter, "hazo_refresh_tokens");
        // Find all password reset tokens
        // If token_type column doesn't exist, query all tokens and filter manually
        let all_tokens = [];
        try {
            all_tokens = (await tokens_service.findBy({
                token_type: "password_reset",
            }));
        }
        catch (error) {
            // If token_type column doesn't exist, get all tokens and we'll verify each one
            const logger = create_app_logger();
            const error_message = error instanceof Error ? error.message : "Unknown error";
            logger.warn("password_reset_service_token_type_column_missing", {
                filename: "password_reset_service.ts",
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
                logger.error("password_reset_service_query_tokens_failed", {
                    filename: "password_reset_service.ts",
                    line_number: 0,
                    error: fallback_error_message,
                });
                return {
                    success: false,
                    error: "Invalid or expired reset token",
                };
            }
        }
        if (!Array.isArray(all_tokens) || all_tokens.length === 0) {
            return {
                success: false,
                error: "Invalid or expired reset token",
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
                error: "Invalid or expired reset token",
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
                error: "Reset token has expired",
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
        // Hash the new password
        const password_hash = await argon2.hash(new_password);
        // Update user's password
        const now_iso = new Date().toISOString();
        await users_service.updateById(user_id, {
            password_hash: password_hash,
            changed_at: now_iso,
        });
        // Delete the used token
        await tokens_service.deleteById(matching_token.id);
        // Send password changed notification email
        const email_result = await send_template_email("password_changed", email, {
            user_email: email,
            user_name: user.name,
        });
        if (!email_result.success) {
            const logger = create_app_logger();
            logger.error("password_reset_service_password_changed_email_failed", {
                filename: "password_reset_service.ts",
                line_number: 0,
                user_id,
                email,
                error: email_result.error,
                note: "Password was reset successfully but notification email failed to send",
            });
        }
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
