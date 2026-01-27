// file_description: server-only helper to read email verification layout configuration from hazo_auth_config.ini
// section: server-only-guard
import "server-only";
// section: imports
import { get_already_logged_in_config } from "./already_logged_in_config.server.js";
import { get_config_value } from "./config/config_loader.server.js";
// Default image path - consuming apps should either:
// 1. Configure their own image_src in hazo_auth_config.ini
// 2. Copy the default images from node_modules/hazo_auth/public/hazo_auth/images/ to their public folder
const DEFAULT_VERIFY_EMAIL_IMAGE_PATH = "/hazo_auth/images/verify_email_default.jpg";
// section: helpers
/**
 * Reads email verification layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Email verification configuration options
 */
export function get_email_verification_config() {
    const section = "hazo_auth__email_verification_layout";
    // Get shared already logged in config
    const alreadyLoggedInConfig = get_already_logged_in_config();
    // Read image configuration
    // If not set in config, falls back to default path-based image
    // Consuming apps should copy images to public/hazo_auth/images/ or configure their own image_src
    const imageSrc = get_config_value(section, "image_src", DEFAULT_VERIFY_EMAIL_IMAGE_PATH);
    const imageAlt = get_config_value(section, "image_alt", "Email verification illustration");
    const imageBackgroundColor = get_config_value(section, "image_background_color", "#f1f5f9");
    return {
        alreadyLoggedInMessage: alreadyLoggedInConfig.message,
        showLogoutButton: alreadyLoggedInConfig.showLogoutButton,
        showReturnHomeButton: alreadyLoggedInConfig.showReturnHomeButton,
        returnHomeButtonLabel: alreadyLoggedInConfig.returnHomeButtonLabel,
        returnHomePath: alreadyLoggedInConfig.returnHomePath,
        imageSrc,
        imageAlt,
        imageBackgroundColor,
    };
}
