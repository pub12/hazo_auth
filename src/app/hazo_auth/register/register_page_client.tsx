// file_description: client component for register page that initializes hazo_connect and renders register layout
// section: client_directive
"use client";

// section: imports
import { useEffect, useState } from "react";
import register_layout from "../../../components/layouts/register";
import { createLayoutDataClient } from "../../../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../../../lib/hazo_connect_setup";
import type { LayoutDataClient } from "../../../components/layouts/shared/data/layout_data_client";

// section: types
type RegisterPageClientProps = {
  showNameField?: boolean;
  passwordRequirements?: {
    minimum_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_number: boolean;
    require_special: boolean;
  };
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
};

// section: component
export function RegisterPageClient({
  showNameField,
  passwordRequirements,
  alreadyLoggedInMessage,
  showLogoutButton,
  showReturnHomeButton,
  returnHomeButtonLabel,
  returnHomePath,
}: RegisterPageClientProps) {
  const [dataClient, setDataClient] = useState<LayoutDataClient<unknown> | null>(null);

  useEffect(() => {
    // Initialize hazo_connect on client side
    const hazoConnect = create_sqlite_hazo_connect();
    const client = createLayoutDataClient(hazoConnect);
    
    setDataClient(client);
  }, []);

  // Show loading state while initializing
  if (!dataClient) {
    return <div className="cls_register_page_loading text-slate-600">Loading...</div>;
  }

  const RegisterLayout = register_layout;

  return (
    <RegisterLayout
      image_src="/globe.svg"
      image_alt="Illustration of a globe representing secure authentication workflows"
      image_background_color="#e2e8f0"
      password_requirements={passwordRequirements}
      show_name_field={showNameField}
      data_client={dataClient}
      alreadyLoggedInMessage={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
    />
  );
}

