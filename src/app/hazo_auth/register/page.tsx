// file_description: test app register page - uses new zero-config RegisterPage server component
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import RegisterPage from "../../../server_pages/register";

// section: component
/**
 * Test app register page
 * Wraps the new zero-config RegisterPage server component in AuthPageShell for test workspace UI
 */
export default function register_page() {
  return (
    <AuthPageShell>
      <RegisterPage />
    </AuthPageShell>
  );
}
