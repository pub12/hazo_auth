import { createCrudService } from "hazo_connect/server";
import argon2 from "argon2";
import { create_app_logger } from "../app_logger";
import { sanitize_error_for_user } from "../utils/error_sanitizer";
import { get_line_number } from "../utils/api_route_helpers";
// section: helpers
/**
 * Authenticates a user by verifying email and password against hazo_users table
 * @param adapter - The hazo_connect adapter instance
 * @param data - Login data (email, password)
 * @returns Login result with success status and user_id or error
 */
export async function authenticate_user(adapter, data) {
    try {
        const { email, password } = data;
        // Create CRUD service for hazo_users table
        const users_service = createCrudService(adapter, "hazo_users");
        // Find user by email
        const users = await users_service.findBy({
            email_address: email,
        });
        // Check if user exists
        if (!Array.isArray(users) || users.length === 0) {
            return {
                success: false,
                error: "Invalid email or password",
            };
        }
        const user = users[0];
        // Check if user is active
        if (user.is_active === false) {
            return {
                success: false,
                error: "Account is inactive. Please contact support.",
            };
        }
        // Verify password using argon2
        const password_hash = user.password_hash;
        const is_password_valid = await argon2.verify(password_hash, password);
        if (!is_password_valid) {
            // Increment login attempts on failed password
            const current_attempts = user.login_attempts || 0;
            const now = new Date().toISOString();
            await users_service.updateById(user.id, {
                login_attempts: current_attempts + 1,
                changed_at: now,
            });
            return {
                success: false,
                error: "Invalid email or password",
            };
        }
        // Check if email is verified
        const email_verified = user.email_verified;
        if (!email_verified) {
            return {
                success: false,
                error: "Email address not verified. Please verify your email before logging in.",
                email_not_verified: true,
            };
        }
        // Password is valid and email is verified - update last_logon and reset login_attempts
        const now = new Date().toISOString();
        await users_service.updateById(user.id, {
            last_logon: now,
            login_attempts: 0,
            changed_at: now,
            url_on_logon: null, // Clear the stored redirect URL after successful login
        });
        return {
            success: true,
            user_id: user.id,
            stored_url_on_logon: user.url_on_logon,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const user_friendly_error = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "login_service.ts",
                line_number: get_line_number(),
                email: data.email,
                operation: "authenticate_user",
            },
        });
        return {
            success: false,
            error: user_friendly_error,
        };
    }
}
