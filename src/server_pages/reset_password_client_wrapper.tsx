// file_description: Client wrapper for ResetPasswordLayout - handles data client initialization on client side
"use client";

// section: imports
import { useEffect, useState } from "react";
import ResetPasswordLayout from "../components/layouts/reset_password";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup";
import type { LayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import type { ResetPasswordConfig } from "../lib/reset_password_config.server";

// section: types
import type { StaticImageData } from "next/image";

export type ResetPasswordClientWrapperProps = Omit<ResetPasswordConfig, 'imageSrc' | 'imageAlt' | 'imageBackgroundColor'> & {
  image_src: string | StaticImageData;
  image_alt: string;
  image_background_color: string;
};

// section: component
/**
 * Client wrapper for ResetPasswordLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export function ResetPasswordClientWrapper({
  image_src,
  image_alt,
  image_background_color,
  passwordRequirements,
  errorMessage,
  successMessage,
  loginPath,
  forgotPasswordPath,
  alreadyLoggedInMessage,
  showLogoutButton,
  showReturnHomeButton,
  returnHomeButtonLabel,
  returnHomePath,
}: ResetPasswordClientWrapperProps) {
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
      <div className="cls_reset_password_page_loading flex items-center justify-center min-h-screen">
        <div className="text-slate-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <ResetPasswordLayout
      image_src={image_src}
      image_alt={image_alt}
      image_background_color={image_background_color}
      data_client={dataClient}
      password_requirements={passwordRequirements}
      errorMessage={errorMessage}
      successMessage={successMessage}
      loginPath={loginPath}
      forgotPasswordPath={forgotPasswordPath}
      alreadyLoggedInMessage={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
    />
  );
}
