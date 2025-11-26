// file_description: server-only helper to read already logged in configuration from hazo_auth_config.ini
// section: imports
import { get_config_value, get_config_boolean } from "hazo_auth/lib/config/config_loader.server";
// section: helpers
/**
 * Reads already logged in configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Already logged in configuration options
 */
export function get_already_logged_in_config() {
    const section = "hazo_auth__already_logged_in";
    // Read message (defaults to "You're already logged in.")
    const message = get_config_value(section, "message", "You're already logged in.");
    // Read show logout button (defaults to true)
    const showLogoutButton = get_config_boolean(section, "show_logout_button", true);
    // Read show return home button (defaults to false)
    const showReturnHomeButton = get_config_boolean(section, "show_return_home_button", false);
    // Read return home button label (defaults to "Return home")
    const returnHomeButtonLabel = get_config_value(section, "return_home_button_label", "Return home");
    // Read return home path (defaults to "/")
    const returnHomePath = get_config_value(section, "return_home_path", "/");
    return {
        message,
        showLogoutButton,
        showReturnHomeButton,
        returnHomeButtonLabel,
        returnHomePath,
    };
}
