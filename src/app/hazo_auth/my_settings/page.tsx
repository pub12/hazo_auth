// file_description: test app my settings page - uses new zero-config MySettingsPage server component
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import MySettingsPage from "../../../server_pages/my_settings";

// section: component
/**
 * Test app my settings page
 * Wraps the new zero-config MySettingsPage server component in AuthPageShell for test workspace UI
 */
export default function my_settings_page() {
  return (
    <AuthPageShell>
      <MySettingsPage />
    </AuthPageShell>
  );
}
