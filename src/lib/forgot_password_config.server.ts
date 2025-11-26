// file_description: server-only helper to read forgot password layout configuration from hazo_auth_config.ini
// section: imports
import { get_already_logged_in_config } from "hazo_auth/lib/already_logged_in_config.server";

// section: types
export type ForgotPasswordConfig = {
  alreadyLoggedInMessage: string;
  showLogoutButton: boolean;
  showReturnHomeButton: boolean;
  returnHomeButtonLabel: string;
  returnHomePath: string;
};

// section: helpers
/**
 * Reads forgot password layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Forgot password configuration options
 */
export function get_forgot_password_config(): ForgotPasswordConfig {
  // Get shared already logged in config
  const alreadyLoggedInConfig = get_already_logged_in_config();

  return {
    alreadyLoggedInMessage: alreadyLoggedInConfig.message,
    showLogoutButton: alreadyLoggedInConfig.showLogoutButton,
    showReturnHomeButton: alreadyLoggedInConfig.showReturnHomeButton,
    returnHomeButtonLabel: alreadyLoggedInConfig.returnHomeButtonLabel,
    returnHomePath: alreadyLoggedInConfig.returnHomePath,
  };
}

