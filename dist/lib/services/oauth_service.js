import { createCrudService } from "hazo_connect/server";
import { randomUUID } from "crypto";
import { create_app_logger } from "../app_logger.js";
import { sanitize_error_for_user } from "../utils/error_sanitizer.js";
import { get_line_number } from "../utils/api_route_helpers.js";
import { get_oauth_config } from "../oauth_config.server.js";
// section: helpers
/**
 * Handles Google OAuth login/registration flow
 * 1. Check if user exists with google_id -> login
 * 2. Check if user exists with email -> link Google account
 * 3. Create new user with Google data
 *
 * @param adapter - The hazo_connect adapter instance
 * @param data - Google OAuth user data
 * @returns OAuth login result with user_id and status flags
 */
export async function handle_google_oauth_login(adapter, data) {
    const logger = create_app_logger();
    try {
        const { google_id, email, name, profile_picture_url, email_verified } = data;
        const oauth_config = get_oauth_config();
        const users_service = createCrudService(adapter, "hazo_users");
        const now = new Date().toISOString();
        // Step 1: Check if user exists with this google_id
        const users_by_google_id = await users_service.findBy({ google_id });
        if (Array.isArray(users_by_google_id) && users_by_google_id.length > 0) {
            const user = users_by_google_id[0];
            // Update last_logon timestamp
            await users_service.updateById(user.id, {
                last_logon: now,
                changed_at: now,
            });
            logger.info("oauth_service_google_login_existing_google_user", {
                filename: "oauth_service.ts",
                line_number: get_line_number(),
                user_id: user.id,
                email: user.email_address,
            });
            return {
                success: true,
                user_id: user.id,
                is_new_user: false,
                was_linked: false,
                email: user.email_address,
                name: user.name,
            };
        }
        // Step 2: Check if user exists with this email
        const users_by_email = await users_service.findBy({ email_address: email });
        if (Array.isArray(users_by_email) && users_by_email.length > 0) {
            const user = users_by_email[0];
            const user_email_verified = user.email_verified;
            // Check if auto-linking is enabled for unverified accounts
            if (!user_email_verified && !oauth_config.auto_link_unverified_accounts) {
                return {
                    success: false,
                    error: "An account with this email exists but is not verified. Please verify your email first.",
                };
            }
            // Link Google account to existing user
            const current_auth_providers = user.auth_providers || "email";
            const new_auth_providers = current_auth_providers.includes("google")
                ? current_auth_providers
                : `${current_auth_providers},google`;
            const update_data = {
                google_id,
                auth_providers: new_auth_providers,
                last_logon: now,
                changed_at: now,
            };
            // If user was unverified and Google verified the email, mark as verified
            if (!user_email_verified && email_verified) {
                update_data.email_verified = true;
                logger.info("oauth_service_auto_verified_email", {
                    filename: "oauth_service.ts",
                    line_number: get_line_number(),
                    user_id: user.id,
                    email,
                });
            }
            // Update name if not set and Google provides one
            if (!user.name && name) {
                update_data.name = name;
            }
            // Update profile picture if not set and Google provides one
            if (!user.profile_picture_url && profile_picture_url) {
                update_data.profile_picture_url = profile_picture_url;
                update_data.profile_source = "custom"; // Use 'custom' for external URLs (Google profile pics)
            }
            await users_service.updateById(user.id, update_data);
            logger.info("oauth_service_google_linked_to_existing", {
                filename: "oauth_service.ts",
                line_number: get_line_number(),
                user_id: user.id,
                email,
                was_unverified: !user_email_verified,
            });
            return {
                success: true,
                user_id: user.id,
                is_new_user: false,
                was_linked: true,
                email: user.email_address,
                name: update_data.name || user.name,
            };
        }
        // Step 3: Create new user with Google data
        const user_id = randomUUID();
        const insert_data = {
            id: user_id,
            email_address: email,
            password_hash: "", // Empty string for Google-only users
            email_verified: email_verified, // Trust Google's verification
            status: "ACTIVE",
            login_attempts: 0,
            google_id,
            auth_providers: "google",
            created_at: now,
            changed_at: now,
            last_logon: now,
        };
        if (name) {
            insert_data.name = name;
        }
        if (profile_picture_url) {
            insert_data.profile_picture_url = profile_picture_url;
            insert_data.profile_source = "custom"; // Use 'custom' for external URLs (Google profile pics)
        }
        const inserted_users = await users_service.insert(insert_data);
        if (!Array.isArray(inserted_users) || inserted_users.length === 0) {
            return {
                success: false,
                error: "Failed to create user account",
            };
        }
        logger.info("oauth_service_google_new_user_created", {
            filename: "oauth_service.ts",
            line_number: get_line_number(),
            user_id,
            email,
        });
        return {
            success: true,
            user_id,
            is_new_user: true,
            was_linked: false,
            email,
            name,
        };
    }
    catch (error) {
        const user_friendly_error = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "oauth_service.ts",
                line_number: get_line_number(),
                email: data.email,
                operation: "handle_google_oauth_login",
            },
        });
        return {
            success: false,
            error: user_friendly_error,
        };
    }
}
/**
 * Links a Google account to an existing user
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user's ID
 * @param google_id - Google's unique user ID
 * @returns Result indicating success or failure
 */
export async function link_google_account(adapter, user_id, google_id) {
    const logger = create_app_logger();
    try {
        const users_service = createCrudService(adapter, "hazo_users");
        const now = new Date().toISOString();
        // Get current user
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return {
                success: false,
                error: "User not found",
            };
        }
        const user = users[0];
        // Check if Google is already linked
        if (user.google_id) {
            return {
                success: false,
                error: "Google account is already linked",
            };
        }
        // Update auth_providers
        const current_auth_providers = user.auth_providers || "email";
        const new_auth_providers = current_auth_providers.includes("google")
            ? current_auth_providers
            : `${current_auth_providers},google`;
        await users_service.updateById(user_id, {
            google_id,
            auth_providers: new_auth_providers,
            changed_at: now,
        });
        logger.info("oauth_service_google_account_linked", {
            filename: "oauth_service.ts",
            line_number: get_line_number(),
            user_id,
        });
        return { success: true };
    }
    catch (error) {
        const user_friendly_error = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "oauth_service.ts",
                line_number: get_line_number(),
                user_id,
                operation: "link_google_account",
            },
        });
        return {
            success: false,
            error: user_friendly_error,
        };
    }
}
/**
 * Checks if a user has a password set (non-empty password_hash)
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user's ID
 * @returns True if user has a password set
 */
export async function user_has_password(adapter, user_id) {
    try {
        const users_service = createCrudService(adapter, "hazo_users");
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return false;
        }
        const password_hash = users[0].password_hash;
        return password_hash !== null && password_hash !== undefined && password_hash !== "";
    }
    catch (_a) {
        return false;
    }
}
/**
 * Checks if a user has a password set by email
 * @param adapter - The hazo_connect adapter instance
 * @param email - The user's email address
 * @returns True if user has a password set
 */
export async function user_has_password_by_email(adapter, email) {
    try {
        const users_service = createCrudService(adapter, "hazo_users");
        const users = await users_service.findBy({ email_address: email });
        if (!Array.isArray(users) || users.length === 0) {
            return false;
        }
        const password_hash = users[0].password_hash;
        return password_hash !== null && password_hash !== undefined && password_hash !== "";
    }
    catch (_a) {
        return false;
    }
}
/**
 * Gets a user's authentication providers and password status
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user's ID
 * @returns Auth providers array and has_password flag
 */
export async function get_user_auth_providers(adapter, user_id) {
    try {
        const users_service = createCrudService(adapter, "hazo_users");
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return {
                success: false,
                error: "User not found",
            };
        }
        const user = users[0];
        const auth_providers_str = user.auth_providers || "email";
        const auth_providers = auth_providers_str.split(",").map((p) => p.trim());
        const password_hash = user.password_hash;
        const has_password = password_hash !== null && password_hash !== undefined && password_hash !== "";
        return {
            success: true,
            auth_providers,
            has_password,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const user_friendly_error = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "oauth_service.ts",
                line_number: get_line_number(),
                user_id,
                operation: "get_user_auth_providers",
            },
        });
        return {
            success: false,
            error: user_friendly_error,
        };
    }
}
/**
 * Sets a password for a user who doesn't have one (e.g., Google-only users)
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user's ID
 * @param password_hash - The hashed password to set
 * @returns Result indicating success or failure
 */
export async function set_user_password(adapter, user_id, password_hash) {
    const logger = create_app_logger();
    try {
        const users_service = createCrudService(adapter, "hazo_users");
        const now = new Date().toISOString();
        // Get current user
        const users = await users_service.findBy({ id: user_id });
        if (!Array.isArray(users) || users.length === 0) {
            return {
                success: false,
                error: "User not found",
            };
        }
        const user = users[0];
        // Update password and auth_providers
        const current_auth_providers = user.auth_providers || "";
        const new_auth_providers = current_auth_providers.includes("email")
            ? current_auth_providers
            : current_auth_providers
                ? `${current_auth_providers},email`
                : "email";
        await users_service.updateById(user_id, {
            password_hash,
            auth_providers: new_auth_providers,
            changed_at: now,
        });
        logger.info("oauth_service_password_set", {
            filename: "oauth_service.ts",
            line_number: get_line_number(),
            user_id,
        });
        return { success: true };
    }
    catch (error) {
        const user_friendly_error = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: "oauth_service.ts",
                line_number: get_line_number(),
                user_id,
                operation: "set_user_password",
            },
        });
        return {
            success: false,
            error: user_friendly_error,
        };
    }
}
