// file_description: server-only helper to read file type configuration from hazo_auth_config.ini
// section: server-only-guard
import "server-only";

// section: imports
import { get_config_array } from "./config/config_loader.server";

// section: types
export type FileTypesConfig = {
  allowed_image_extensions: string[];
  allowed_image_mime_types: string[];
};

// section: helpers
/**
 * Reads file type configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns File types configuration options
 */
export function get_file_types_config(): FileTypesConfig {
  const section = "hazo_auth__file_types";

  return {
    allowed_image_extensions: get_config_array(section, "allowed_image_extensions", ["jpg", "jpeg", "png"]),
    allowed_image_mime_types: get_config_array(section, "allowed_image_mime_types", ["image/jpeg", "image/jpg", "image/png"]),
  };
}

