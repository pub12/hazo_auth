import "server-only";
/**
 * A single app permission declaration
 */
export type AppPermission = {
    permission_name: string;
    description: string;
};
/**
 * App permissions configuration
 */
export type AppPermissionsConfig = {
    permissions: AppPermission[];
    permissions_map: Map<string, string>;
};
/**
 * Reads app permissions configuration from hazo_auth_config.ini file
 * Format in INI file:
 *   [hazo_auth__app_permissions]
 *   app_permission_1 = permission_name:Description for debugging
 *   app_permission_2 = another_perm:Another description
 *
 * @returns App permissions configuration with list and map of permissions
 */
export declare function get_app_permissions_config(): AppPermissionsConfig;
/**
 * Gets the description for a specific permission
 * @param permission_name - The permission name to look up
 * @returns Description or undefined if not found in app permissions config
 */
export declare function get_app_permission_description(permission_name: string): string | undefined;
/**
 * Gets descriptions for multiple permissions
 * @param permission_names - Array of permission names to look up
 * @returns Map of permission names to descriptions (only includes found permissions)
 */
export declare function get_app_permission_descriptions(permission_names: string[]): Map<string, string>;
//# sourceMappingURL=app_permissions_config.server.d.ts.map