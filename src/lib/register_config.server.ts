// file_description: server-only helper to read register layout configuration from hazo_auth_config.ini
// section: imports
import { get_config_boolean, get_config_value, read_config_section } from "./config/config_loader.server";
import { get_password_requirements_config } from "./password_requirements_config.server";
import { get_already_logged_in_config } from "./already_logged_in_config.server";
import { get_user_fields_config } from "./user_fields_config.server";
import registerDefaultImage from "../assets/images/register_default.jpg";

// section: types
export type RegisterConfig = {
  showNameField: boolean;
  passwordRequirements: {
    minimum_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_number: boolean;
    require_special: boolean;
  };
  alreadyLoggedInMessage: string;
  showLogoutButton: boolean;
  showReturnHomeButton: boolean;
  returnHomeButtonLabel: string;
  returnHomePath: string;
  signInPath: string;
  signInLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  imageBackgroundColor?: string;
};

// section: helpers
/**
 * Reads register layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Register configuration options
 */
export function get_register_config(): RegisterConfig {
  // Get shared user fields config (preferred) or fall back to register section for backwards compatibility
  const userFieldsConfig = get_user_fields_config();
  const register_section = read_config_section("hazo_auth__register_layout");
  
  // Use register section if explicitly set, otherwise use shared config
  const showNameField = register_section?.show_name_field !== undefined
    ? get_config_boolean("hazo_auth__register_layout", "show_name_field", true)
    : userFieldsConfig.show_name_field;

  // Get shared password requirements
  const passwordRequirements = get_password_requirements_config();

  // Get shared already logged in config
  const alreadyLoggedInConfig = get_already_logged_in_config();

  // Read sign in link configuration
  const signInPath = get_config_value(
    "hazo_auth__register_layout",
    "sign_in_path",
    "/hazo_auth/login"
  );
  const signInLabel = get_config_value(
    "hazo_auth__register_layout",
    "sign_in_label",
    "Sign in"
  );

  // Read image configuration
  // If not set in config, falls back to default image from assets
  const imageSrc = get_config_value(
    "hazo_auth__register_layout",
    "image_src",
    "" // Empty string means not set in config
  ) || registerDefaultImage;

  const imageAlt = get_config_value(
    "hazo_auth__register_layout",
    "image_alt",
    "Modern building representing user registration"
  );
  const imageBackgroundColor = get_config_value(
    "hazo_auth__register_layout",
    "image_background_color",
    "#e2e8f0"
  );

  return {
    showNameField,
    passwordRequirements,
    alreadyLoggedInMessage: alreadyLoggedInConfig.message,
    showLogoutButton: alreadyLoggedInConfig.showLogoutButton,
    showReturnHomeButton: alreadyLoggedInConfig.showReturnHomeButton,
    returnHomeButtonLabel: alreadyLoggedInConfig.returnHomeButtonLabel,
    returnHomePath: alreadyLoggedInConfig.returnHomePath,
    signInPath,
    signInLabel,
    imageSrc,
    imageAlt,
    imageBackgroundColor,
  };
}

