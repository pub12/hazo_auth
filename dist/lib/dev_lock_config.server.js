// file_description: server-only helper to read dev lock configuration from hazo_auth_config.ini
// section: imports
import { get_config_value, get_config_boolean, get_config_number } from "./config/config_loader.server";
import { DEFAULT_DEV_LOCK } from "./config/default_config";
// section: constants
const SECTION_NAME = "hazo_auth__dev_lock";
// section: helpers
/**
 * Reads dev lock configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Dev lock configuration options
 */
export function get_dev_lock_config() {
    const enable = get_config_boolean(SECTION_NAME, "enable", DEFAULT_DEV_LOCK.enable);
    const session_duration_days = get_config_number(SECTION_NAME, "session_duration_days", DEFAULT_DEV_LOCK.session_duration_days);
    const background_color = get_config_value(SECTION_NAME, "background_color", DEFAULT_DEV_LOCK.background_color);
    const logo_path = get_config_value(SECTION_NAME, "logo_path", DEFAULT_DEV_LOCK.logo_path);
    const logo_width = get_config_number(SECTION_NAME, "logo_width", DEFAULT_DEV_LOCK.logo_width);
    const logo_height = get_config_number(SECTION_NAME, "logo_height", DEFAULT_DEV_LOCK.logo_height);
    const application_name = get_config_value(SECTION_NAME, "application_name", DEFAULT_DEV_LOCK.application_name);
    const limited_access_text = get_config_value(SECTION_NAME, "limited_access_text", DEFAULT_DEV_LOCK.limited_access_text);
    const password_placeholder = get_config_value(SECTION_NAME, "password_placeholder", DEFAULT_DEV_LOCK.password_placeholder);
    const submit_button_text = get_config_value(SECTION_NAME, "submit_button_text", DEFAULT_DEV_LOCK.submit_button_text);
    const error_message = get_config_value(SECTION_NAME, "error_message", DEFAULT_DEV_LOCK.error_message);
    const text_color = get_config_value(SECTION_NAME, "text_color", DEFAULT_DEV_LOCK.text_color);
    const accent_color = get_config_value(SECTION_NAME, "accent_color", DEFAULT_DEV_LOCK.accent_color);
    return {
        enable,
        session_duration_days,
        background_color,
        logo_path,
        logo_width,
        logo_height,
        application_name,
        limited_access_text,
        password_placeholder,
        submit_button_text,
        error_message,
        text_color,
        accent_color,
    };
}
/**
 * Helper to check if dev lock is enabled in config
 * Note: Also requires HAZO_AUTH_DEV_LOCK_ENABLED env var for actual enforcement
 * @returns true if dev lock is enabled in config
 */
export function is_dev_lock_enabled() {
    return get_config_boolean(SECTION_NAME, "enable", DEFAULT_DEV_LOCK.enable);
}
