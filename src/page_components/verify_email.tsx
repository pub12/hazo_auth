// file_description: zero-config verify email page component for hazo_auth
// Consumers can use this directly without needing to configure props
"use client";

// section: imports
import { useEffect, useState } from "react";
import email_verification_layout from "../components/layouts/email_verification";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup";
import type { LayoutDataClient } from "../components/layouts/shared/data/layout_data_client";

// section: constants
const DEFAULT_IMAGE_SRC = "/globe.svg";
const DEFAULT_IMAGE_ALT = "Illustration of a globe representing secure authentication workflows";
const DEFAULT_IMAGE_BG = "#e2e8f0";

// section: types
export type VerifyEmailPageProps = {
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
  redirectDelay?: number;
  loginPath?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageBackgroundColor?: string;
};

// section: component
/**
 * Zero-config verify email page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Verify email page component
 */
export function VerifyEmailPage({
  alreadyLoggedInMessage = "You are already logged in",
  showLogoutButton = true,
  showReturnHomeButton = false,
  returnHomeButtonLabel = "Return home",
  returnHomePath = "/",
  redirectDelay = 3000,
  loginPath = "/hazo_auth/login",
  imageSrc = DEFAULT_IMAGE_SRC,
  imageAlt = DEFAULT_IMAGE_ALT,
  imageBackgroundColor = DEFAULT_IMAGE_BG,
}: VerifyEmailPageProps = {}) {
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

  const EmailVerificationLayout = email_verification_layout;

  return (
    <EmailVerificationLayout
      image_src={imageSrc}
      image_alt={imageAlt}
      image_background_color={imageBackgroundColor}
      data_client={dataClient}
      already_logged_in_message={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
      redirect_delay={redirectDelay}
      login_path={loginPath}
    />
  );
}

export default VerifyEmailPage;

