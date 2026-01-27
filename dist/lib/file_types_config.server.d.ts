import "server-only";
export type FileTypesConfig = {
    allowed_image_extensions: string[];
    allowed_image_mime_types: string[];
};
/**
 * Reads file type configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns File types configuration options
 */
export declare function get_file_types_config(): FileTypesConfig;
//# sourceMappingURL=file_types_config.server.d.ts.map