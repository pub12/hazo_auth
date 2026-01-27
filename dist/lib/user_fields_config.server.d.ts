import "server-only";
export type UserFieldsConfig = {
    show_name_field: boolean;
    show_email_field: boolean;
    show_password_field: boolean;
};
/**
 * Reads shared user fields configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * This configuration is used by register and my_settings layouts
 * @returns User fields configuration options
 */
export declare function get_user_fields_config(): UserFieldsConfig;
//# sourceMappingURL=user_fields_config.server.d.ts.map