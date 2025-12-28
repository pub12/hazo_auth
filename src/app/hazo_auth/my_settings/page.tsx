// file_description: test app my settings page - uses new zero-config MySettingsPage server component
// section: imports
import MySettingsPage from "../../../server_pages/my_settings";

// section: component
/**
 * Test app my settings page
 * Uses the zero-config MySettingsPage server component which includes AuthPageShell internally
 */
export default function my_settings_page() {
  return <MySettingsPage />;
}
