// file_description: test app verify email page - uses new zero-config VerifyEmailPage server component
// section: imports
import VerifyEmailPage from "../../../server_pages/verify_email";

// section: component
/**
 * Test app verify email page
 * Uses the zero-config VerifyEmailPage server component which includes AuthPageShell internally
 */
export default function verify_email_page() {
  return <VerifyEmailPage />;
}
