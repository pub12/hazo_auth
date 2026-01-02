import { createCrudService } from "hazo_connect/server";
import argon2 from "argon2";
import { get_password_requirements_config } from "../password_requirements_config.server.js";
import { send_template_email } from "./email_service.js";
import { create_app_logger } from "../app_logger.js";
// section: helpers
/**
 * Changes a user's password
 * Verifies the current password, validates the new password, and updates the password hash
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user ID to update
 * @param data - Password change data (current_password, new_password)
 * @returns Password change result with success status or error
 */
export async function change_password(adapter, user_id, data) {
    try {
        const { current_password, new_password } = data;
        // Create CRUD service for hazo_users table
        const users_service = createCrudService(adapter, "hazo_users");
        // Get current user data
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
        const password_hash = user.password_hash;
        const email = user.email_address;
        const user_name = user.name;
        // Verify current password
        try {
            const is_valid = await argon2.verify(password_hash, current_password);
            if (!is_valid) {
                return {
                    success: false,
                    error: "Current password is incorrect",
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: "Failed to verify current password",
            };
        }
        // Get password requirements from config
        const password_requirements = get_password_requirements_config();
        // Validate new password
        if (!new_password || new_password.length < password_requirements.minimum_length) {
            return {
                success: false,
                error: `Password must be at least ${password_requirements.minimum_length} characters long`,
            };
        }
        if (password_requirements.require_uppercase && !/[A-Z]/.test(new_password)) {
            return {
                success: false,
                error: "Password must contain at least one uppercase letter",
            };
        }
        if (password_requirements.require_lowercase && !/[a-z]/.test(new_password)) {
            return {
                success: false,
                error: "Password must contain at least one lowercase letter",
            };
        }
        if (password_requirements.require_number && !/[0-9]/.test(new_password)) {
            return {
                success: false,
                error: "Password must contain at least one number",
            };
        }
        if (password_requirements.require_special && !/[^A-Za-z0-9]/.test(new_password)) {
            return {
                success: false,
                error: "Password must contain at least one special character",
            };
        }
        // Hash the new password
        const new_password_hash = await argon2.hash(new_password);
        // Update password hash in database
        const now = new Date().toISOString();
        await users_service.updateById(user_id, {
            password_hash: new_password_hash,
            changed_at: now,
        });
        // Send password changed notification email
        const email_result = await send_template_email("password_changed", email, {
            user_email: email,
            user_name: user_name,
        });
        if (!email_result.success) {
            const logger = create_app_logger();
            logger.error("password_change_service_email_failed", {
                filename: "password_change_service.ts",
                line_number: 0,
                user_id,
                email,
                error: email_result.error,
                note: "Password was changed successfully but notification email failed to send",
            });
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
