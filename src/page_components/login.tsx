// file_description: zero-config login page component for hazo_auth
// Consumers can use this directly without needing to configure props
//
// ⚠️ DEPRECATED: This client component is deprecated in hazo_auth v2.0+
// Please use the new server component version instead:
//
// import { LoginPage } from "hazo_auth/pages/login";
//
// The new version:
// - Initializes on the server (no loading state)
// - Works with your app's hazo_connect instance
// - True zero-config "drop in and use"
// - Better performance (smaller bundle)
//
// This file will be removed in v3.0
//
"use client";

// section: imports
import { useEffect, useState } from "react";
import login_layout from "../components/layouts/login";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup";
import { create_app_logger } from "../lib/app_logger";
import type { LayoutDataClient } from "../components/layouts/shared/data/layout_data_client";

// section: constants
const DEFAULT_IMAGE_SRC = "/globe.svg";
const DEFAULT_IMAGE_ALT = "Illustration of a globe representing secure authentication workflows";
const DEFAULT_IMAGE_BG = "#e2e8f0";

// section: types
/**
 * @deprecated This client component is deprecated in hazo_auth v2.0+
 * Use the new server component version instead: `import { LoginPage } from "hazo_auth/pages/login"`
 */
export type LoginPageProps = {
  redirectRoute?: string;
  successMessage?: string;
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
  forgotPasswordPath?: string;
  forgotPasswordLabel?: string;
  createAccountPath?: string;
  createAccountLabel?: string;
  urlOnLogon?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageBackgroundColor?: string;
};

// section: component
/**
 * Zero-config login page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Login page component
 */
export function LoginPage({
  redirectRoute,
  successMessage = "Successfully logged in",
  alreadyLoggedInMessage = "You are already logged in",
  showLogoutButton = true,
  showReturnHomeButton = false,
  returnHomeButtonLabel = "Return home",
  returnHomePath = "/",
  forgotPasswordPath = "/hazo_auth/forgot_password",
  forgotPasswordLabel = "Forgot password?",
  createAccountPath = "/hazo_auth/register",
  createAccountLabel = "Create account",
  urlOnLogon,
  imageSrc = DEFAULT_IMAGE_SRC,
  imageAlt = DEFAULT_IMAGE_ALT,
  imageBackgroundColor = DEFAULT_IMAGE_BG,
}: LoginPageProps = {}) {
  const [dataClient, setDataClient] = useState<LayoutDataClient<unknown> | null>(null);
  const [logger, setLogger] = useState<ReturnType<typeof create_app_logger> | null>(null);

  useEffect(() => {
    // Initialize hazo_connect and logger on client side
    const hazoConnect = create_sqlite_hazo_connect();
    const client = createLayoutDataClient(hazoConnect);
    const appLogger = create_app_logger();
    
    setDataClient(client);
    setLogger(appLogger);
  }, []);

  // Show loading state while initializing
  if (!dataClient || !logger) {
    return (
      <div className="cls_login_page_loading flex items-center justify-center min-h-screen">
        <div className="text-slate-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  const LoginLayout = login_layout;

  return (
    <LoginLayout
      image_src={imageSrc}
      image_alt={imageAlt}
      image_background_color={imageBackgroundColor}
      data_client={dataClient}
      logger={logger}
      redirectRoute={redirectRoute}
      successMessage={successMessage}
      alreadyLoggedInMessage={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
      forgot_password_path={forgotPasswordPath}
      forgot_password_label={forgotPasswordLabel}
      create_account_path={createAccountPath}
      create_account_label={createAccountLabel}
      urlOnLogon={urlOnLogon}
    />
  );
}

export default LoginPage;

