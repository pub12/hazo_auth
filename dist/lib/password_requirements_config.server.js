// file_description: server-only helper to read shared password requirements configuration from hazo_auth_config.ini
// section: imports
import { get_config_number, get_config_boolean } from "./config/config_loader.server";
// section: helpers
/**
 * Reads shared password requirements configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * This configuration is used by both register and reset password layouts
 * @returns Password requirements configuration options
 */
export function get_password_requirements_config() {
    const section = "hazo_auth__password_requirements";
    // Read password requirements with defaults
    const minimum_length = get_config_number(section, "minimum_length", 8);
    const require_uppercase = get_config_boolean(section, "require_uppercase", false);
    const require_lowercase = get_config_boolean(section, "require_lowercase", false);
    const require_number = get_config_boolean(section, "require_number", false);
    const require_special = get_config_boolean(section, "require_special", false);
    return {
        minimum_length,
        require_uppercase,
        require_lowercase,
        require_number,
        require_special,
    };
}
