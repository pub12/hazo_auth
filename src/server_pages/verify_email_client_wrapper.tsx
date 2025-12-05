// file_description: Client wrapper for EmailVerificationLayout - handles data client initialization on client side
"use client";

// section: imports
import { useEffect, useState } from "react";
import EmailVerificationLayout from "../components/layouts/email_verification";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup";
import type { LayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import type { EmailVerificationConfig } from "../lib/email_verification_config.server";

// section: types
export type VerifyEmailClientWrapperProps = EmailVerificationConfig & {
  image_src: string;
  image_alt: string;
  image_background_color: string;
  redirect_delay: number;
  login_path: string;
};

// section: component
/**
 * Client wrapper for EmailVerificationLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export function VerifyEmailClientWrapper({
  image_src,
  image_alt,
  image_background_color,
  redirect_delay,
  login_path,
  alreadyLoggedInMessage,
  showLogoutButton,
  showReturnHomeButton,
  returnHomeButtonLabel,
  returnHomePath,
}: VerifyEmailClientWrapperProps) {
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
      <div className="cls_verify_email_page_loading flex items-center justify-center min-h-screen">
        <div className="text-slate-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <EmailVerificationLayout
      image_src={image_src}
      image_alt={image_alt}
      image_background_color={image_background_color}
      data_client={dataClient}
      redirect_delay={redirect_delay}
      login_path={login_path}
      sign_in_label="Back to login"
      already_logged_in_message={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
    />
  );
}
