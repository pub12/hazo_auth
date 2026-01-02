// file_description: server-only helper to read reset password layout configuration from hazo_auth_config.ini
// section: imports
import { get_config_value } from "./config/config_loader.server.js";
import { get_already_logged_in_config } from "./already_logged_in_config.server.js";
import { get_password_requirements_config } from "./password_requirements_config.server.js";
// Default image path - consuming apps should either:
// 1. Configure their own image_src in hazo_auth_config.ini
// 2. Copy the default images from node_modules/hazo_auth/public/hazo_auth/images/ to their public folder
const DEFAULT_RESET_PASSWORD_IMAGE_PATH = "/hazo_auth/images/reset_password_default.jpg";
// section: helpers
/**
 * Reads reset password layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Reset password configuration options
 */
export function get_reset_password_config() {
    const section = "hazo_auth__reset_password_layout";
    // Get shared already logged in config
    const alreadyLoggedInConfig = get_already_logged_in_config();
    // Read error message (defaults to standard message)
    const errorMessage = get_config_value(section, "error_message", "Reset password link invalid or has expired. Please go to Reset Password page to get a new link.");
    // Read success message (defaults to standard message)
    const successMessage = get_config_value(section, "success_message", "Password reset successfully. Redirecting to login...");
    // Read login path (defaults to "/hazo_auth/login")
    const loginPath = get_config_value(section, "login_path", "/hazo_auth/login");
    // Read forgot password path (defaults to "/hazo_auth/forgot_password")
    const forgotPasswordPath = get_config_value(section, "forgot_password_path", "/hazo_auth/forgot_password");
    // Get shared password requirements
    const passwordRequirements = get_password_requirements_config();
    // Read image configuration
    // If not set in config, falls back to default path-based image
    // Consuming apps should copy images to public/hazo_auth/images/ or configure their own image_src
    const imageSrc = get_config_value(section, "image_src", DEFAULT_RESET_PASSWORD_IMAGE_PATH);
    const imageAlt = get_config_value(section, "image_alt", "Reset password illustration");
    const imageBackgroundColor = get_config_value(section, "image_background_color", "#f1f5f9");
    return {
        errorMessage,
        successMessage,
        loginPath,
        forgotPasswordPath,
        alreadyLoggedInMessage: alreadyLoggedInConfig.message,
        showLogoutButton: alreadyLoggedInConfig.showLogoutButton,
        showReturnHomeButton: alreadyLoggedInConfig.showReturnHomeButton,
        returnHomeButtonLabel: alreadyLoggedInConfig.returnHomeButtonLabel,
        returnHomePath: alreadyLoggedInConfig.returnHomePath,
        passwordRequirements,
        imageSrc,
        imageAlt,
        imageBackgroundColor,
    };
}
