// file_description: demo page for dev lock screen - loads config from INI file
// This page is shown when the dev lock is enabled and user needs to enter password
// section: imports
import { DevLockPage } from "../../../page_components/dev_lock";
import { get_dev_lock_config } from "../../../lib/dev_lock_config.server";

// section: component
/**
 * Dev lock demo page
 * Loads configuration from hazo_auth_config.ini and renders the lock screen
 * Note: This page is NOT wrapped in AuthPageShell because it's a full-screen lock
 */
export default function dev_lock_page() {
  const config = get_dev_lock_config();

  return (
    <DevLockPage
      background_color={config.background_color}
      logo_path={config.logo_path}
      logo_width={config.logo_width}
      logo_height={config.logo_height}
      application_name={config.application_name}
      limited_access_text={config.limited_access_text}
      password_placeholder={config.password_placeholder}
      submit_button_text={config.submit_button_text}
      error_message={config.error_message}
      text_color={config.text_color}
      accent_color={config.accent_color}
    />
  );
}
