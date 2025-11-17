// file_description: render the forgot password page shell and mount the forgot password layout component within sidebar
// section: imports
import { SidebarLayoutWrapper } from "@/components/layouts/shared/components/sidebar_layout_wrapper";
import { ForgotPasswordPageClient } from "./forgot_password_page_client";
import { get_forgot_password_config } from "@/lib/forgot_password_config.server";

// section: component
export default function forgot_password_page() {
  // Read forgot password configuration from hazo_auth_config.ini (server-side)
  const forgotPasswordConfig = get_forgot_password_config();

  return (
    <SidebarLayoutWrapper>
      <ForgotPasswordPageClient
        alreadyLoggedInMessage={forgotPasswordConfig.alreadyLoggedInMessage}
        showLogoutButton={forgotPasswordConfig.showLogoutButton}
        showReturnHomeButton={forgotPasswordConfig.showReturnHomeButton}
        returnHomeButtonLabel={forgotPasswordConfig.returnHomeButtonLabel}
        returnHomePath={forgotPasswordConfig.returnHomePath}
      />
    </SidebarLayoutWrapper>
  );
}

