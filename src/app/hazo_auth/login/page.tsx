// file_description: render the login page shell and mount the login layout component within sidebar
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { LoginPageClient } from "./login_page_client";
import { get_login_config } from "../../../lib/login_config.server";

// section: component
export default function login_page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Read login configuration from hazo_auth_config.ini (server-side)
  const loginConfig = get_login_config();

  // Get url_on_logon from query params (if any)
  const urlOnLogon = typeof searchParams.url_on_logon === "string" ? searchParams.url_on_logon : undefined;

  return (
    <AuthPageShell>
      <LoginPageClient
        redirectRoute={loginConfig.redirectRoute}
        successMessage={loginConfig.successMessage}
        alreadyLoggedInMessage={loginConfig.alreadyLoggedInMessage}
        showLogoutButton={loginConfig.showLogoutButton}
        showReturnHomeButton={loginConfig.showReturnHomeButton}
        returnHomeButtonLabel={loginConfig.returnHomeButtonLabel}
        returnHomePath={loginConfig.returnHomePath}
        forgotPasswordPath={loginConfig.forgotPasswordPath}
        forgotPasswordLabel={loginConfig.forgotPasswordLabel}
        createAccountPath={loginConfig.createAccountPath}
        createAccountLabel={loginConfig.createAccountLabel}
        urlOnLogon={urlOnLogon}
      />
    </AuthPageShell>
  );
}

