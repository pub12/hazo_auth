// file_description: server-only helper to read user-facing messages from hazo_auth_config.ini
// section: server-only-guard
import "server-only";

// section: imports
import { get_config_value } from "./config/config_loader.server";

// section: types
export type MessagesConfig = {
  photo_upload_disabled_message: string;
  gravatar_setup_message: string;
  gravatar_no_account_message: string;
  library_tooltip_message: string;
};

// section: helpers
/**
 * Reads user-facing messages from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Messages configuration options
 */
export function get_messages_config(): MessagesConfig {
  const section = "hazo_auth__messages";

  return {
    photo_upload_disabled_message: get_config_value(
      section,
      "photo_upload_disabled_message",
      "Photo upload is not enabled. Please contact your administrator."
    ),
    gravatar_setup_message: get_config_value(
      section,
      "gravatar_setup_message",
      "To set up your Gravatar:"
    ),
    gravatar_no_account_message: get_config_value(
      section,
      "gravatar_no_account_message",
      "You don't have a Gravatar account set up for this email address."
    ),
    library_tooltip_message: get_config_value(
      section,
      "library_tooltip_message",
      "Select another tab image style to remove this image"
    ),
  };
}

