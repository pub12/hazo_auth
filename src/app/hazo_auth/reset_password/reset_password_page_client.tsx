// file_description: client component for reset password page that initializes hazo_connect and renders reset password layout
// section: client_directive
"use client";

// section: imports
import { useEffect, useState } from "react";
import reset_password_layout from "@/components/layouts/reset_password";
import { createLayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "@/lib/hazo_connect_setup";
import type { LayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";

// section: types
type ResetPasswordPageClientProps = {
  errorMessage?: string;
  successMessage?: string;
  loginPath?: string;
  forgotPasswordPath?: string;
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
  passwordRequirements?: {
    minimum_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_number: boolean;
    require_special: boolean;
  };
};

// section: component
export function ResetPasswordPageClient({
  errorMessage,
  successMessage,
  loginPath,
  forgotPasswordPath,
  alreadyLoggedInMessage,
  showLogoutButton,
  showReturnHomeButton,
  returnHomeButtonLabel,
  returnHomePath,
  passwordRequirements,
}: ResetPasswordPageClientProps) {
  const [dataClient, setDataClient] = useState<LayoutDataClient<unknown> | null>(null);

  useEffect(() => {
    // Initialize hazo_connect on client side
    const hazoConnect = create_sqlite_hazo_connect();
    const client = createLayoutDataClient(hazoConnect);
    
    setDataClient(client);
  }, []);

  // Show loading state while initializing
  if (!dataClient) {
    return <div className="cls_reset_password_page_loading text-slate-600">Loading...</div>;
  }

  const ResetPasswordLayout = reset_password_layout;

  return (
    <ResetPasswordLayout
      image_src="/globe.svg"
      image_alt="Illustration of a globe representing secure authentication workflows"
      image_background_color="#e2e8f0"
      data_client={dataClient}
      errorMessage={errorMessage}
      successMessage={successMessage}
      loginPath={loginPath}
      forgotPasswordPath={forgotPasswordPath}
      alreadyLoggedInMessage={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
      password_requirements={passwordRequirements}
    />
  );
}

