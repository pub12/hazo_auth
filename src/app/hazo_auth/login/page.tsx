// file_description: test app login page - uses new zero-config LoginPage server component
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import LoginPage from "../../../server_pages/login";

// section: component
/**
 * Test app login page
 * Wraps the new zero-config LoginPage server component in AuthPageShell for test workspace UI
 */
export default function login_page() {
  return (
    <AuthPageShell>
      <LoginPage />
    </AuthPageShell>
  );
}
