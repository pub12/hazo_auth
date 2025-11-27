// file_description: server-only helper to read email verification layout configuration from hazo_auth_config.ini
// section: imports
import { get_already_logged_in_config } from "./already_logged_in_config.server";
// section: helpers
/**
 * Reads email verification layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Email verification configuration options
 */
export function get_email_verification_config() {
    // Get shared already logged in config
    const alreadyLoggedInConfig = get_already_logged_in_config();
    return {
        alreadyLoggedInMessage: alreadyLoggedInConfig.message,
        showLogoutButton: alreadyLoggedInConfig.showLogoutButton,
        showReturnHomeButton: alreadyLoggedInConfig.showReturnHomeButton,
        returnHomeButtonLabel: alreadyLoggedInConfig.returnHomeButtonLabel,
        returnHomePath: alreadyLoggedInConfig.returnHomePath,
    };
}
