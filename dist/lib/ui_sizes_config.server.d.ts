export type UISizesConfig = {
    gravatar_size: number;
    profile_picture_size: number;
    tooltip_icon_size_default: number;
    tooltip_icon_size_small: number;
    library_photo_grid_columns: number;
    library_photo_preview_size: number;
    image_compression_max_dimension: number;
    upload_file_hard_limit_bytes: number;
};
/**
 * Reads UI size configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns UI sizes configuration options
 */
export declare function get_ui_sizes_config(): UISizesConfig;
//# sourceMappingURL=ui_sizes_config.server.d.ts.map