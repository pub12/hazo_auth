// file_description: render the email verification page shell and mount the email verification layout component within sidebar
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { VerifyEmailPageClient } from "./verify_email_page_client";
import { get_email_verification_config } from "../../../lib/email_verification_config.server";

// section: component
export default function verify_email_page() {
  // Read email verification configuration from hazo_auth_config.ini (server-side)
  const emailVerificationConfig = get_email_verification_config();

  return (
    <AuthPageShell>
      <VerifyEmailPageClient
        alreadyLoggedInMessage={emailVerificationConfig.alreadyLoggedInMessage}
        showLogoutButton={emailVerificationConfig.showLogoutButton}
        showReturnHomeButton={emailVerificationConfig.showReturnHomeButton}
        returnHomeButtonLabel={emailVerificationConfig.returnHomeButtonLabel}
        returnHomePath={emailVerificationConfig.returnHomePath}
      />
    </AuthPageShell>
  );
}

