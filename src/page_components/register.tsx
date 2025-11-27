// file_description: zero-config register page component for hazo_auth
// Consumers can use this directly without needing to configure props
"use client";

// section: imports
import { useEffect, useState } from "react";
import register_layout from "../components/layouts/register";
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
export type RegisterPageProps = {
  showNameField?: boolean;
  passwordRequirements?: PasswordRequirementOverrides;
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
  signInPath?: string;
  signInLabel?: string;
  urlOnLogon?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageBackgroundColor?: string;
};

// section: component
/**
 * Zero-config register page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Register page component
 */
export function RegisterPage({
  showNameField = true,
  passwordRequirements = DEFAULT_PASSWORD_REQUIREMENTS,
  alreadyLoggedInMessage = "You are already logged in",
  showLogoutButton = true,
  showReturnHomeButton = false,
  returnHomeButtonLabel = "Return home",
  returnHomePath = "/",
  signInPath = "/hazo_auth/login",
  signInLabel = "Sign in",
  urlOnLogon,
  imageSrc = DEFAULT_IMAGE_SRC,
  imageAlt = DEFAULT_IMAGE_ALT,
  imageBackgroundColor = DEFAULT_IMAGE_BG,
}: RegisterPageProps = {}) {
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
      <div className="cls_register_page_loading flex items-center justify-center min-h-screen">
        <div className="text-slate-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  const RegisterLayout = register_layout;

  return (
    <RegisterLayout
      image_src={imageSrc}
      image_alt={imageAlt}
      image_background_color={imageBackgroundColor}
      password_requirements={passwordRequirements}
      show_name_field={showNameField}
      data_client={dataClient}
      alreadyLoggedInMessage={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
      signInPath={signInPath}
      signInLabel={signInLabel}
      urlOnLogon={urlOnLogon}
    />
  );
}

export default RegisterPage;

