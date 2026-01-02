// file_description: Client wrapper for LoginLayout - handles data client initialization on client side
"use client";

// section: imports
import { useEffect, useState } from "react";
import LoginLayout from "../components/layouts/login/index";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup";
import type { LayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import type { LoginConfig } from "../lib/login_config.server";
import type { OAuthLayoutConfig } from "../components/layouts/login/index";

// section: types
import type { StaticImageData } from "next/image";

export type LoginClientWrapperProps = Omit<LoginConfig, 'imageSrc' | 'imageAlt' | 'imageBackgroundColor' | 'oauth'> & {
  image_src: string | StaticImageData;
  image_alt: string;
  image_background_color: string;
  /** OAuth configuration */
  oauth?: OAuthLayoutConfig;
};

// section: component
/**
 * Client wrapper for LoginLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export function LoginClientWrapper({
  image_src,
  image_alt,
  image_background_color,
  redirectRoute,
  successMessage,
  alreadyLoggedInMessage,
  showLogoutButton,
  showReturnHomeButton,
  returnHomeButtonLabel,
  returnHomePath,
  forgotPasswordPath,
  forgotPasswordLabel,
  createAccountPath,
  createAccountLabel,
  oauth,
}: LoginClientWrapperProps) {
  const [dataClient, setDataClient] = useState<LayoutDataClient<unknown> | null>(null);

  useEffect(() => {
    // Initialize hazo_connect on client side
    const hazoConnect = create_sqlite_hazo_connect();
    const client = createLayoutDataClient(hazoConnect);

    setDataClient(client);
  }, []);

  // Show loading state while initializing
  if (!dataClient) {
    return (
      <div className="cls_login_page_loading flex items-center justify-center min-h-screen">
        <div className="text-slate-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <LoginLayout
      image_src={image_src}
      image_alt={image_alt}
      image_background_color={image_background_color}
      data_client={dataClient}
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
      oauth={oauth}
    />
  );
}
