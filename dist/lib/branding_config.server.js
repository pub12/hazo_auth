// file_description: server-only helper to read firm branding configuration from hazo_auth_config.ini
// section: imports
import { get_config_value, get_config_number, get_config_boolean, } from "./config/config_loader.server";
// section: constants
const SECTION_NAME = "hazo_auth__firm_branding";
// section: helpers
/**
 * Parses a comma-separated string into an array of trimmed values
 */
function parse_formats(formats_string) {
    return formats_string
        .split(",")
        .map((f) => f.trim().toLowerCase())
        .filter((f) => f.length > 0);
}
/**
 * Reads firm branding configuration from hazo_auth_config.ini file
 * Falls back to defaults if config file is not found or section is missing
 * @returns Firm branding configuration options
 */
export function get_branding_config() {
    const enable_branding = get_config_boolean(SECTION_NAME, "enable_branding", true);
    const default_logo_path = get_config_value(SECTION_NAME, "default_logo_path", "/hazo_auth/images/default_firm_logo.png");
    const logo_upload_path = get_config_value(SECTION_NAME, "logo_upload_path", "./uploads/firm_logos");
    const max_logo_size_kb = get_config_number(SECTION_NAME, "max_logo_size_kb", 500);
    const allowed_formats_string = get_config_value(SECTION_NAME, "allowed_logo_formats", "png,jpg,jpeg,svg");
    const allowed_logo_formats = parse_formats(allowed_formats_string);
    const default_primary_color = get_config_value(SECTION_NAME, "default_primary_color", "");
    const default_secondary_color = get_config_value(SECTION_NAME, "default_secondary_color", "");
    return {
        enable_branding,
        default_logo_path,
        logo_upload_path,
        max_logo_size_kb,
        allowed_logo_formats,
        default_primary_color,
        default_secondary_color,
    };
}
/**
 * Checks if firm branding is enabled in the configuration
 * Convenience function for quick checks
 */
export function is_branding_enabled() {
    return get_config_boolean(SECTION_NAME, "enable_branding", true);
}
/**
 * Validates if a file extension is allowed for logo uploads
 */
export function is_allowed_logo_format(extension) {
    const config = get_branding_config();
    const normalized = extension.toLowerCase().replace(/^\./, "");
    return config.allowed_logo_formats.includes(normalized);
}
/**
 * Gets the max file size in bytes for logo uploads
 */
export function get_max_logo_size_bytes() {
    const config = get_branding_config();
    return config.max_logo_size_kb * 1024;
}
