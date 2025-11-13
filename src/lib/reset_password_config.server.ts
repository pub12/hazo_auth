// file_description: server-only helper to read reset password layout configuration from hazo_auth_config.ini
// section: imports
import { get_config_value } from "./config/config_loader.server";
import { get_already_logged_in_config } from "./already_logged_in_config.server";
import { get_password_requirements_config } from "./password_requirements_config.server";

// section: types
export type ResetPasswordConfig = {
  errorMessage: string;
  successMessage: string;
  loginPath: string;
  forgotPasswordPath: string;
  alreadyLoggedInMessage: string;
  showLogoutButton: boolean;
  showReturnHomeButton: boolean;
  returnHomeButtonLabel: string;
  returnHomePath: string;
  passwordRequirements: {
    minimum_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_number: boolean;
    require_special: boolean;
  };
};

// section: helpers
/**
 * Reads reset password layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Reset password configuration options
 */
export function get_reset_password_config(): ResetPasswordConfig {
  const section = "hazo_auth__reset_password_layout";

  // Get shared already logged in config
  const alreadyLoggedInConfig = get_already_logged_in_config();

  // Read error message (defaults to standard message)
  const errorMessage = get_config_value(
    section,
    "error_message",
    "Reset password link invalid or has expired. Please go to Reset Password page to get a new link."
  );

  // Read success message (defaults to standard message)
  const successMessage = get_config_value(
    section,
    "success_message",
    "Password reset successfully. Redirecting to login..."
  );

  // Read login path (defaults to "/login")
  const loginPath = get_config_value(section, "login_path", "/login");

  // Read forgot password path (defaults to "/forgot_password")
  const forgotPasswordPath = get_config_value(section, "forgot_password_path", "/forgot_password");

  // Get shared password requirements
  const passwordRequirements = get_password_requirements_config();

  return {
    errorMessage,
    successMessage,
    loginPath,
    forgotPasswordPath,
    alreadyLoggedInMessage: alreadyLoggedInConfig.message,
    showLogoutButton: alreadyLoggedInConfig.showLogoutButton,
    showReturnHomeButton: alreadyLoggedInConfig.showReturnHomeButton,
    returnHomeButtonLabel: alreadyLoggedInConfig.returnHomeButtonLabel,
    returnHomePath: alreadyLoggedInConfig.returnHomePath,
    passwordRequirements,
  };
}

