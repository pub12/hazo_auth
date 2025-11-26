// file_description: server-only helper to read user management configuration from hazo_auth_config.ini
// section: imports
import { get_config_array, read_config_section } from "hazo_auth/lib/config/config_loader.server";
// section: helpers
/**
 * Reads user management configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns User management configuration options
 */
export function get_user_management_config() {
    // Try to read from hazo_auth__user_management section first
    const user_management_section = read_config_section("hazo_auth__user_management");
    const permissions_section = read_config_section("permissions");
    // Try application_permission_list_defaults from user_management section
    let permission_list = [];
    if (user_management_section === null || user_management_section === void 0 ? void 0 : user_management_section.application_permission_list_defaults) {
        permission_list = get_config_array("hazo_auth__user_management", "application_permission_list_defaults", []);
    }
    else if (permissions_section === null || permissions_section === void 0 ? void 0 : permissions_section.list) {
        // Fallback to permissions section list key
        permission_list = get_config_array("permissions", "list", []);
    }
    return {
        application_permission_list_defaults: permission_list,
    };
}
