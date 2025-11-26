// file_description: server-only helper to read shared user fields configuration from hazo_auth_config.ini
// section: imports
import { get_config_boolean } from "hazo_auth/lib/config/config_loader.server";

// section: types
export type UserFieldsConfig = {
  show_name_field: boolean;
  show_email_field: boolean;
  show_password_field: boolean;
};

// section: helpers
/**
 * Reads shared user fields configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * This configuration is used by register and my_settings layouts
 * @returns User fields configuration options
 */
export function get_user_fields_config(): UserFieldsConfig {
  // Read field visibility with defaults (all true by default)
  const show_name_field = get_config_boolean("hazo_auth__user_fields", "show_name_field", true);
  const show_email_field = get_config_boolean("hazo_auth__user_fields", "show_email_field", true);
  const show_password_field = get_config_boolean("hazo_auth__user_fields", "show_password_field", true);

  return {
    show_name_field,
    show_email_field,
    show_password_field,
  };
}

