// file_description: test app verify email page - uses new zero-config VerifyEmailPage server component
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import VerifyEmailPage from "../../../server_pages/verify_email";

// section: component
/**
 * Test app verify email page
 * Wraps the new zero-config VerifyEmailPage server component in AuthPageShell for test workspace UI
 */
export default function verify_email_page() {
  return (
    <AuthPageShell>
      <VerifyEmailPage />
    </AuthPageShell>
  );
}
