// file_description: server-only helper to read UI size configuration from hazo_auth_config.ini
// section: server-only-guard
import "server-only";
// section: imports
import { get_config_number } from "./config/config_loader.server.js";
// section: helpers
/**
 * Reads UI size configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns UI sizes configuration options
 */
export function get_ui_sizes_config() {
    const section = "hazo_auth__ui_sizes";
    return {
        gravatar_size: get_config_number(section, "gravatar_size", 200),
        profile_picture_size: get_config_number(section, "profile_picture_size", 200),
        tooltip_icon_size_default: get_config_number(section, "tooltip_icon_size_default", 16),
        tooltip_icon_size_small: get_config_number(section, "tooltip_icon_size_small", 14),
        library_photo_grid_columns: get_config_number(section, "library_photo_grid_columns", 4),
        library_photo_preview_size: get_config_number(section, "library_photo_preview_size", 200),
        image_compression_max_dimension: get_config_number(section, "image_compression_max_dimension", 200),
        upload_file_hard_limit_bytes: get_config_number(section, "upload_file_hard_limit_bytes", 10485760), // 10MB
    };
}
