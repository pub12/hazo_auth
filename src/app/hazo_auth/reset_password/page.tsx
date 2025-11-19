// file_description: render the reset password page shell and mount the reset password layout component within sidebar
// section: imports
import { SidebarLayoutWrapper } from "../../../components/layouts/shared/components/sidebar_layout_wrapper";
import { ResetPasswordPageClient } from "./reset_password_page_client";
import { get_reset_password_config } from "../../../lib/reset_password_config.server";

// section: component
export default function reset_password_page() {
  // Read reset password configuration from hazo_auth_config.ini (server-side)
  const resetPasswordConfig = get_reset_password_config();

  return (
    <SidebarLayoutWrapper>
      <ResetPasswordPageClient
        errorMessage={resetPasswordConfig.errorMessage}
        successMessage={resetPasswordConfig.successMessage}
        loginPath={resetPasswordConfig.loginPath}
        forgotPasswordPath={resetPasswordConfig.forgotPasswordPath}
        alreadyLoggedInMessage={resetPasswordConfig.alreadyLoggedInMessage}
        showLogoutButton={resetPasswordConfig.showLogoutButton}
        showReturnHomeButton={resetPasswordConfig.showReturnHomeButton}
        returnHomeButtonLabel={resetPasswordConfig.returnHomeButtonLabel}
        returnHomePath={resetPasswordConfig.returnHomePath}
        passwordRequirements={resetPasswordConfig.passwordRequirements}
      />
    </SidebarLayoutWrapper>
  );
}

