// file_description: server-only helper to read app permissions configuration from hazo_auth_config.ini
// section: server-only-guard
import "server-only";

// This allows consuming apps to declare their required permissions with descriptions for debugging
// section: imports
import { read_config_section } from "./config/config_loader.server";

// section: types

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
  permissions_map: Map<string, string>; // permission_name -> description
};

// section: helpers

/**
 * Reads app permissions configuration from hazo_auth_config.ini file
 * Format in INI file:
 *   [hazo_auth__app_permissions]
 *   app_permission_1 = permission_name:Description for debugging
 *   app_permission_2 = another_perm:Another description
 *
 * @returns App permissions configuration with list and map of permissions
 */
export function get_app_permissions_config(): AppPermissionsConfig {
  const section = read_config_section("hazo_auth__app_permissions");
  const permissions: AppPermission[] = [];
  const permissions_map = new Map<string, string>();

  if (section) {
    // Iterate through all keys in section that start with "app_permission_"
    for (const [key, value] of Object.entries(section)) {
      if (key.startsWith("app_permission_") && typeof value === "string") {
        const colonIndex = value.indexOf(":");
        if (colonIndex > 0) {
          const permission_name = value.substring(0, colonIndex).trim();
          const description = value.substring(colonIndex + 1).trim();
          if (permission_name && description) {
            permissions.push({ permission_name, description });
            permissions_map.set(permission_name, description);
          }
        }
      }
    }
  }

  return {
    permissions,
    permissions_map,
  };
}

/**
 * Gets the description for a specific permission
 * @param permission_name - The permission name to look up
 * @returns Description or undefined if not found in app permissions config
 */
export function get_app_permission_description(
  permission_name: string,
): string | undefined {
  const config = get_app_permissions_config();
  return config.permissions_map.get(permission_name);
}

/**
 * Gets descriptions for multiple permissions
 * @param permission_names - Array of permission names to look up
 * @returns Map of permission names to descriptions (only includes found permissions)
 */
export function get_app_permission_descriptions(
  permission_names: string[],
): Map<string, string> {
  const config = get_app_permissions_config();
  const result = new Map<string, string>();

  for (const name of permission_names) {
    const description = config.permissions_map.get(name);
    if (description) {
      result.set(name, description);
    }
  }

  return result;
}
