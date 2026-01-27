// file_description: server-only helper to read profile picture configuration from hazo_auth_config.ini
// section: server-only-guard
import "server-only";

// section: imports
import { get_config_boolean, get_config_value, get_config_number, read_config_section } from "./config/config_loader.server";
import { create_app_logger } from "./app_logger";

// section: types
export type ProfilePictureConfig = {
  allow_photo_upload: boolean;
  upload_photo_path?: string;
  max_photo_size: number; // in bytes
  user_photo_default: boolean;
  user_photo_default_priority1: "gravatar" | "library";
  user_photo_default_priority2?: "library" | "gravatar";
  library_photo_path: string; // relative to public directory
};

// section: helpers
/**
 * Reads profile picture configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Profile picture configuration options
 */
export function get_profile_picture_config(): ProfilePictureConfig {
  const logger = create_app_logger();
  const section = "hazo_auth__profile_picture";

  // Read configuration with defaults
  const allow_photo_upload = get_config_boolean(section, "allow_photo_upload", false);
  const upload_photo_path = get_config_value(section, "upload_photo_path", "");
  const max_photo_size = get_config_number(section, "max_photo_size", 51200); // Default: 50kb
  const user_photo_default = get_config_boolean(section, "user_photo_default", true);
  const user_photo_default_priority1 = (get_config_value(section, "user_photo_default_priority1", "gravatar") as "gravatar" | "library");
  const priority2_value = get_config_value(section, "user_photo_default_priority2", "");
  const user_photo_default_priority2 = priority2_value ? (priority2_value as "library" | "gravatar") : undefined;
  const library_photo_path = get_config_value(section, "library_photo_path", "/profile_pictures/library");

  // Validate upload_photo_path if allow_photo_upload is true
  if (allow_photo_upload && !upload_photo_path) {
    logger.warn("profile_picture_config_validation_failed", {
      filename: "profile_picture_config.server.ts",
      line_number: 0,
      message: "allow_photo_upload is true but upload_photo_path is not set",
    });
  }

  return {
    allow_photo_upload,
    upload_photo_path: upload_photo_path || undefined,
    max_photo_size,
    user_photo_default,
    user_photo_default_priority1,
    user_photo_default_priority2,
    library_photo_path,
  };
}

