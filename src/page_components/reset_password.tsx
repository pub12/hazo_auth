// file_description: zero-config reset password page component for hazo_auth
// Consumers can use this directly without needing to configure props
"use client";

// section: imports
import { useEffect, useState } from "react";
import reset_password_layout from "../components/layouts/reset_password";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup";
import type { LayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import type { PasswordRequirementOverrides } from "../components/layouts/shared/config/layout_customization";

// section: constants
const DEFAULT_IMAGE_SRC = "/globe.svg";
const DEFAULT_IMAGE_ALT = "Illustration of a globe representing secure authentication workflows";
const DEFAULT_IMAGE_BG = "#e2e8f0";

const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirementOverrides = {
  minimum_length: 8,
  require_uppercase: true,
  require_lowercase: true,
  require_number: true,
  require_special: false,
};

// section: types
export type ResetPasswordPageProps = {
  errorMessage?: string;
  successMessage?: string;
  loginPath?: string;
  forgotPasswordPath?: string;
  passwordRequirements?: PasswordRequirementOverrides;
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageBackgroundColor?: string;
};

// section: component
/**
 * Zero-config reset password page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Reset password page component
 */
export function ResetPasswordPage({
  errorMessage = "Your password reset link has expired or is invalid",
  successMessage = "Password reset successful! You can now log in with your new password.",
  loginPath = "/hazo_auth/login",
  forgotPasswordPath = "/hazo_auth/forgot_password",
  passwordRequirements = DEFAULT_PASSWORD_REQUIREMENTS,
  alreadyLoggedInMessage = "You are already logged in",
  showLogoutButton = true,
  showReturnHomeButton = false,
  returnHomeButtonLabel = "Return home",
  returnHomePath = "/",
  imageSrc = DEFAULT_IMAGE_SRC,
  imageAlt = DEFAULT_IMAGE_ALT,
  imageBackgroundColor = DEFAULT_IMAGE_BG,
}: ResetPasswordPageProps = {}) {
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

  const ResetPasswordLayout = reset_password_layout;

  return (
    <ResetPasswordLayout
      image_src={imageSrc}
      image_alt={imageAlt}
      image_background_color={imageBackgroundColor}
      data_client={dataClient}
      errorMessage={errorMessage}
      successMessage={successMessage}
      password_requirements={passwordRequirements}
      alreadyLoggedInMessage={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
    />
  );
}

export default ResetPasswordPage;

