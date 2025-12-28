// file_description: test app forgot password page - uses new zero-config ForgotPasswordPage server component
// section: imports
import ForgotPasswordPage from "../../../server_pages/forgot_password";

// section: component
/**
 * Test app forgot password page
 * Uses the zero-config ForgotPasswordPage server component which includes AuthPageShell internally
 */
export default function forgot_password_page() {
  return <ForgotPasswordPage />;
}
