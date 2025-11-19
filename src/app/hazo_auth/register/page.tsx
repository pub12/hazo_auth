// file_description: render the register page shell and mount the register layout component within sidebar
// section: imports
import { SidebarLayoutWrapper } from "../../../components/layouts/shared/components/sidebar_layout_wrapper";
import { RegisterPageClient } from "./register_page_client";
import { get_register_config } from "../../../lib/register_config.server";

// section: component
export default function register_page() {
  // Read register configuration from hazo_auth_config.ini (server-side)
  const registerConfig = get_register_config();

  return (
    <SidebarLayoutWrapper>
      <RegisterPageClient
        showNameField={registerConfig.showNameField}
        passwordRequirements={registerConfig.passwordRequirements}
        alreadyLoggedInMessage={registerConfig.alreadyLoggedInMessage}
        showLogoutButton={registerConfig.showLogoutButton}
        showReturnHomeButton={registerConfig.showReturnHomeButton}
        returnHomeButtonLabel={registerConfig.returnHomeButtonLabel}
        returnHomePath={registerConfig.returnHomePath}
      />
    </SidebarLayoutWrapper>
  );
}

