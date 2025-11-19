// file_description: render the login page shell and mount the login layout component within sidebar
// section: imports
import { SidebarLayoutWrapper } from "../../../components/layouts/shared/components/sidebar_layout_wrapper";
import { LoginPageClient } from "./login_page_client";
import { get_login_config } from "../../../lib/login_config.server";

// section: component
export default function login_page() {
  // Read login configuration from hazo_auth_config.ini (server-side)
  const loginConfig = get_login_config();

  return (
    <SidebarLayoutWrapper>
      <LoginPageClient
        redirectRoute={loginConfig.redirectRoute}
        successMessage={loginConfig.successMessage}
        alreadyLoggedInMessage={loginConfig.alreadyLoggedInMessage}
        showLogoutButton={loginConfig.showLogoutButton}
        showReturnHomeButton={loginConfig.showReturnHomeButton}
        returnHomeButtonLabel={loginConfig.returnHomeButtonLabel}
        returnHomePath={loginConfig.returnHomePath}
      />
    </SidebarLayoutWrapper>
  );
}

