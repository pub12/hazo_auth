// file_description: server-only helper to read navbar configuration from hazo_auth_config.ini
// section: server-only-guard
import "server-only";
// section: imports
import { get_config_value, get_config_boolean, get_config_number } from "./config/config_loader.server.js";
import { DEFAULT_NAVBAR } from "./config/default_config.js";
// section: constants
const SECTION_NAME = "hazo_auth__navbar";
// section: helpers
/**
 * Reads navbar configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Navbar configuration options
 */
export function get_navbar_config() {
    const enable_navbar = get_config_boolean(SECTION_NAME, "enable_navbar", DEFAULT_NAVBAR.enable_navbar);
    const logo_path = get_config_value(SECTION_NAME, "logo_path", DEFAULT_NAVBAR.logo_path);
    const logo_width = get_config_number(SECTION_NAME, "logo_width", DEFAULT_NAVBAR.logo_width);
    const logo_height = get_config_number(SECTION_NAME, "logo_height", DEFAULT_NAVBAR.logo_height);
    const company_name = get_config_value(SECTION_NAME, "company_name", DEFAULT_NAVBAR.company_name);
    const home_path = get_config_value(SECTION_NAME, "home_path", DEFAULT_NAVBAR.home_path);
    const home_label = get_config_value(SECTION_NAME, "home_label", DEFAULT_NAVBAR.home_label);
    const show_home_link = get_config_boolean(SECTION_NAME, "show_home_link", DEFAULT_NAVBAR.show_home_link);
    const background_color = get_config_value(SECTION_NAME, "background_color", DEFAULT_NAVBAR.background_color);
    const text_color = get_config_value(SECTION_NAME, "text_color", DEFAULT_NAVBAR.text_color);
    const height = get_config_number(SECTION_NAME, "height", DEFAULT_NAVBAR.height);
    return {
        enable_navbar,
        logo_path,
        logo_width,
        logo_height,
        company_name,
        home_path,
        home_label,
        show_home_link,
        background_color,
        text_color,
        height,
    };
}
/**
 * Helper to check if navbar is enabled in config
 * @returns true if navbar is enabled
 */
export function is_navbar_enabled() {
    return get_config_boolean(SECTION_NAME, "enable_navbar", DEFAULT_NAVBAR.enable_navbar);
}
