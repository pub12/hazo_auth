// file_description: server-only helper to read forgot password layout configuration from hazo_auth_config.ini
// section: imports
import { get_already_logged_in_config } from "./already_logged_in_config.server";
import { get_config_value } from "./config/config_loader.server";
import forgotPasswordDefaultImage from "../assets/images/forgot_password_default.jpg";

// section: types
export type ForgotPasswordConfig = {
  alreadyLoggedInMessage: string;
  showLogoutButton: boolean;
  showReturnHomeButton: boolean;
  returnHomeButtonLabel: string;
  returnHomePath: string;
  imageSrc?: string;
  imageAlt?: string;
  imageBackgroundColor?: string;
};

// section: helpers
/**
 * Reads forgot password layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Forgot password configuration options
 */
export function get_forgot_password_config(): ForgotPasswordConfig {
  const section = "hazo_auth__forgot_password_layout";

  // Get shared already logged in config
  const alreadyLoggedInConfig = get_already_logged_in_config();

  // Read image configuration
  // If not set in config, falls back to default image from assets
  const imageSrc = get_config_value(
    section,
    "image_src",
    "" // Empty string means not set in config
  ) || forgotPasswordDefaultImage;

  const imageAlt = get_config_value(
    section,
    "image_alt",
    "Password recovery illustration"
  );
  const imageBackgroundColor = get_config_value(
    section,
    "image_background_color",
    "#f1f5f9"
  );

  return {
    alreadyLoggedInMessage: alreadyLoggedInConfig.message,
    showLogoutButton: alreadyLoggedInConfig.showLogoutButton,
    showReturnHomeButton: alreadyLoggedInConfig.showReturnHomeButton,
    returnHomeButtonLabel: alreadyLoggedInConfig.returnHomeButtonLabel,
    returnHomePath: alreadyLoggedInConfig.returnHomePath,
    imageSrc,
    imageAlt,
    imageBackgroundColor,
  };
}

