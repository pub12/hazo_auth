// file_description: render the email verification page shell and mount the email verification layout component within sidebar
// section: imports
import { SidebarLayoutWrapper } from "@/components/layouts/shared/components/sidebar_layout_wrapper";
import { VerifyEmailPageClient } from "./verify_email_page_client";
import { get_email_verification_config } from "@/lib/email_verification_config.server";

// section: component
export default function verify_email_page() {
  // Read email verification configuration from hazo_auth_config.ini (server-side)
  const emailVerificationConfig = get_email_verification_config();

  return (
    <SidebarLayoutWrapper>
      <VerifyEmailPageClient
        alreadyLoggedInMessage={emailVerificationConfig.alreadyLoggedInMessage}
        showLogoutButton={emailVerificationConfig.showLogoutButton}
        showReturnHomeButton={emailVerificationConfig.showReturnHomeButton}
        returnHomeButtonLabel={emailVerificationConfig.returnHomeButtonLabel}
        returnHomePath={emailVerificationConfig.returnHomePath}
      />
    </SidebarLayoutWrapper>
  );
}

