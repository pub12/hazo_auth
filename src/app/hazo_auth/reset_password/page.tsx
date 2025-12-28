// file_description: test app reset password page - uses new zero-config ResetPasswordPage server component
// section: imports
import ResetPasswordPage from "../../../server_pages/reset_password";

// section: component
/**
 * Test app reset password page
 * Uses the zero-config ResetPasswordPage server component which includes AuthPageShell internally
 */
export default function reset_password_page() {
  return <ResetPasswordPage />;
}
