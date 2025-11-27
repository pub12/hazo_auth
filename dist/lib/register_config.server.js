// file_description: server-only helper to read register layout configuration from hazo_auth_config.ini
// section: imports
import { get_config_boolean, get_config_value, read_config_section } from "./config/config_loader.server";
import { get_password_requirements_config } from "./password_requirements_config.server";
import { get_already_logged_in_config } from "./already_logged_in_config.server";
import { get_user_fields_config } from "./user_fields_config.server";
// section: helpers
/**
 * Reads register layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Register configuration options
 */
export function get_register_config() {
    // Get shared user fields config (preferred) or fall back to register section for backwards compatibility
    const userFieldsConfig = get_user_fields_config();
    const register_section = read_config_section("hazo_auth__register_layout");
    // Use register section if explicitly set, otherwise use shared config
    const showNameField = (register_section === null || register_section === void 0 ? void 0 : register_section.show_name_field) !== undefined
        ? get_config_boolean("hazo_auth__register_layout", "show_name_field", true)
        : userFieldsConfig.show_name_field;
    // Get shared password requirements
    const passwordRequirements = get_password_requirements_config();
    // Get shared already logged in config
    const alreadyLoggedInConfig = get_already_logged_in_config();
    // Read sign in link configuration
    const signInPath = get_config_value("hazo_auth__register_layout", "sign_in_path", "/hazo_auth/login");
    const signInLabel = get_config_value("hazo_auth__register_layout", "sign_in_label", "Sign in");
    return {
        showNameField,
        passwordRequirements,
        alreadyLoggedInMessage: alreadyLoggedInConfig.message,
        showLogoutButton: alreadyLoggedInConfig.showLogoutButton,
        showReturnHomeButton: alreadyLoggedInConfig.showReturnHomeButton,
        returnHomeButtonLabel: alreadyLoggedInConfig.returnHomeButtonLabel,
        returnHomePath: alreadyLoggedInConfig.returnHomePath,
        signInPath,
        signInLabel,
    };
}
