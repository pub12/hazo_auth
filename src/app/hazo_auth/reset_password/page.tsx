// file_description: test app reset password page - uses new zero-config ResetPasswordPage server component
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import ResetPasswordPage from "../../../server_pages/reset_password";

// section: component
/**
 * Test app reset password page
 * Wraps the new zero-config ResetPasswordPage server component in AuthPageShell for test workspace UI
 */
export default function reset_password_page() {
  return (
    <AuthPageShell>
      <ResetPasswordPage />
    </AuthPageShell>
  );
}
