// file_description: render the register page shell and mount the register layout component within sidebar
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { RegisterPageClient } from "./register_page_client";
import { get_register_config } from "../../../lib/register_config.server";

// section: component
export default function register_page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Read register configuration from hazo_auth_config.ini (server-side)
  const registerConfig = get_register_config();

  // Get url_on_logon from query params (if any)
  const urlOnLogon = typeof searchParams.url_on_logon === "string" ? searchParams.url_on_logon : undefined;

  return (
    <AuthPageShell>
      <RegisterPageClient
        showNameField={registerConfig.showNameField}
        passwordRequirements={registerConfig.passwordRequirements}
        alreadyLoggedInMessage={registerConfig.alreadyLoggedInMessage}
        showLogoutButton={registerConfig.showLogoutButton}
        showReturnHomeButton={registerConfig.showReturnHomeButton}
        returnHomeButtonLabel={registerConfig.returnHomeButtonLabel}
        returnHomePath={registerConfig.returnHomePath}
        signInPath={registerConfig.signInPath}
        signInLabel={registerConfig.signInLabel}
        urlOnLogon={urlOnLogon}
      />
    </AuthPageShell>
  );
}

