export type UserManagementConfig = {
    application_permission_list_defaults: string[];
};
/**
 * Reads user management configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns User management configuration options
 */
export declare function get_user_management_config(): UserManagementConfig;
//# sourceMappingURL=user_management_config.server.d.ts.map