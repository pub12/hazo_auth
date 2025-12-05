// file_description: test app forgot password page - uses new zero-config ForgotPasswordPage server component
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import ForgotPasswordPage from "../../../server_pages/forgot_password";

// section: component
/**
 * Test app forgot password page
 * Wraps the new zero-config ForgotPasswordPage server component in AuthPageShell for test workspace UI
 */
export default function forgot_password_page() {
  return (
    <AuthPageShell>
      <ForgotPasswordPage />
    </AuthPageShell>
  );
}
