// file_description: server-only helper to read OAuth configuration from hazo_auth_config.ini
// section: imports
import { get_config_value, get_config_boolean } from "./config/config_loader.server";
import { DEFAULT_OAUTH } from "./config/default_config";

// section: types
export type OAuthConfig = {
  /** Enable Google OAuth login */
  enable_google: boolean;
  /** Enable traditional email/password login */
  enable_email_password: boolean;
  /** Auto-link Google login to existing unverified email/password accounts */
  auto_link_unverified_accounts: boolean;
  /** Text displayed on the Google sign-in button */
  google_button_text: string;
  /** Text displayed on the divider between OAuth and email/password form */
  oauth_divider_text: string;
};

// section: constants
const SECTION_NAME = "hazo_auth__oauth";

// section: helpers
/**
 * Reads OAuth configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns OAuth configuration options
 */
export function get_oauth_config(): OAuthConfig {
  const enable_google = get_config_boolean(
    SECTION_NAME,
    "enable_google",
    DEFAULT_OAUTH.enable_google
  );

  const enable_email_password = get_config_boolean(
    SECTION_NAME,
    "enable_email_password",
    DEFAULT_OAUTH.enable_email_password
  );

  const auto_link_unverified_accounts = get_config_boolean(
    SECTION_NAME,
    "auto_link_unverified_accounts",
    DEFAULT_OAUTH.auto_link_unverified_accounts
  );

  const google_button_text = get_config_value(
    SECTION_NAME,
    "google_button_text",
    DEFAULT_OAUTH.google_button_text
  );

  const oauth_divider_text = get_config_value(
    SECTION_NAME,
    "oauth_divider_text",
    DEFAULT_OAUTH.oauth_divider_text
  );

  return {
    enable_google,
    enable_email_password,
    auto_link_unverified_accounts,
    google_button_text,
    oauth_divider_text,
  };
}

/**
 * Helper to check if Google OAuth is enabled
 * @returns true if Google OAuth is enabled in config
 */
export function is_google_oauth_enabled(): boolean {
  return get_config_boolean(SECTION_NAME, "enable_google", DEFAULT_OAUTH.enable_google);
}

/**
 * Helper to check if email/password login is enabled
 * @returns true if email/password login is enabled in config
 */
export function is_email_password_enabled(): boolean {
  return get_config_boolean(
    SECTION_NAME,
    "enable_email_password",
    DEFAULT_OAUTH.enable_email_password
  );
}
