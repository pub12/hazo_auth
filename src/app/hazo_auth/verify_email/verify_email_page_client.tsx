// file_description: client component for verify email page that initializes hazo_connect and renders email verification layout
// section: client_directive
"use client";

// section: imports
import { useEffect, useState } from "react";
import email_verification_layout from "../../../components/layouts/email_verification";
import { createLayoutDataClient } from "../../../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../../../lib/hazo_connect_setup";
import type { LayoutDataClient } from "../../../components/layouts/shared/data/layout_data_client";

// section: types
type VerifyEmailPageClientProps = {
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
};

// section: component
export function VerifyEmailPageClient({
  alreadyLoggedInMessage,
  showLogoutButton,
  showReturnHomeButton,
  returnHomeButtonLabel,
  returnHomePath,
}: VerifyEmailPageClientProps) {
  const [dataClient, setDataClient] = useState<LayoutDataClient<unknown> | null>(null);

  useEffect(() => {
    // Initialize hazo_connect on client side
    const hazoConnect = create_sqlite_hazo_connect();
    const client = createLayoutDataClient(hazoConnect);
    
    setDataClient(client);
  }, []);

  // Show loading state while initializing
  if (!dataClient) {
    return <div className="cls_verify_email_page_loading text-slate-600">Loading...</div>;
  }

  const EmailVerificationLayout = email_verification_layout;

  return (
    <EmailVerificationLayout
      image_src="/globe.svg"
      image_alt="Illustration of a globe representing secure authentication workflows"
      image_background_color="#e2e8f0"
      data_client={dataClient}
      already_logged_in_message={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
    />
  );
}

