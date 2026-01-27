// file_description: server-only helper to read login layout configuration from hazo_auth_config.ini
// section: server-only-guard
import "server-only";

// section: imports
import { get_config_value } from "./config/config_loader.server";
import { get_already_logged_in_config } from "./already_logged_in_config.server";
import { get_oauth_config, type OAuthConfig } from "./oauth_config.server";

// Default image path - consuming apps should either:
// 1. Configure their own image_src in hazo_auth_config.ini
// 2. Copy the default images from node_modules/hazo_auth/public/hazo_auth/images/ to their public folder
const DEFAULT_LOGIN_IMAGE_PATH = "/hazo_auth/images/login_default.jpg";

// section: types
export type LoginConfig = {
  redirectRoute?: string;
  successMessage: string;
  alreadyLoggedInMessage: string;
  showLogoutButton: boolean;
  showReturnHomeButton: boolean;
  returnHomeButtonLabel: string;
  returnHomePath: string;
  forgotPasswordPath: string;
  forgotPasswordLabel: string;
  createAccountPath: string;
  createAccountLabel: string;
  imageSrc: string;
  imageAlt: string;
  imageBackgroundColor: string;
  /** OAuth configuration */
  oauth: OAuthConfig;
};

// section: helpers
/**
 * Reads login layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Login configuration options
 */
export function get_login_config(): LoginConfig {
  const section = "hazo_auth__login_layout";

  // Read redirect route (optional)
  const redirectRouteValue = get_config_value(section, "redirect_route_on_successful_login", "");
  const redirectRoute = redirectRouteValue || undefined;

  // Read success message (defaults to "Successfully logged in")
  const successMessage = get_config_value(section, "success_message", "Successfully logged in");

  const forgotPasswordPath = get_config_value(
    section,
    "forgot_password_path",
    "/hazo_auth/forgot_password"
  );
  const forgotPasswordLabel = get_config_value(
    section,
    "forgot_password_label",
    "Forgot password?"
  );
  const createAccountPath = get_config_value(section, "create_account_path", "/hazo_auth/register");
  const createAccountLabel = get_config_value(
    section,
    "create_account_label",
    "Create account"
  );

  // Get shared already logged in config
  const alreadyLoggedInConfig = get_already_logged_in_config();

  // Read image configuration
  // If not set in config, falls back to default path-based image
  // Consuming apps should copy images to public/hazo_auth/images/ or configure their own image_src
  const imageSrc = get_config_value(
    section,
    "image_src",
    DEFAULT_LOGIN_IMAGE_PATH
  );

  const imageAlt = get_config_value(
    section,
    "image_alt",
    "Secure login illustration"
  );
  const imageBackgroundColor = get_config_value(
    section,
    "image_background_color",
    "#f1f5f9"
  );

  // Get OAuth configuration
  const oauth = get_oauth_config();

  return {
    redirectRoute,
    successMessage,
    alreadyLoggedInMessage: alreadyLoggedInConfig.message,
    showLogoutButton: alreadyLoggedInConfig.showLogoutButton,
    showReturnHomeButton: alreadyLoggedInConfig.showReturnHomeButton,
    returnHomeButtonLabel: alreadyLoggedInConfig.returnHomeButtonLabel,
    returnHomePath: alreadyLoggedInConfig.returnHomePath,
    forgotPasswordPath,
    forgotPasswordLabel,
    createAccountPath,
    createAccountLabel,
    imageSrc,
    imageAlt,
    imageBackgroundColor,
    oauth,
  };
}

