// file_description: server-only helper to read login layout configuration from hazo_auth_config.ini
// section: imports
import { get_config_value } from "./config/config_loader.server";
import { get_already_logged_in_config } from "./already_logged_in_config.server";

// section: types
export type LoginConfig = {
  redirectRoute?: string;
  successMessage: string;
  alreadyLoggedInMessage: string;
  showLogoutButton: boolean;
  showReturnHomeButton: boolean;
  returnHomeButtonLabel: string;
  returnHomePath: string;
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

  // Get shared already logged in config
  const alreadyLoggedInConfig = get_already_logged_in_config();

  return {
    redirectRoute,
    successMessage,
    alreadyLoggedInMessage: alreadyLoggedInConfig.message,
    showLogoutButton: alreadyLoggedInConfig.showLogoutButton,
    showReturnHomeButton: alreadyLoggedInConfig.showReturnHomeButton,
    returnHomeButtonLabel: alreadyLoggedInConfig.returnHomeButtonLabel,
    returnHomePath: alreadyLoggedInConfig.returnHomePath,
  };
}

