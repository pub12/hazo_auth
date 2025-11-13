// file_description: client component for login page that initializes hazo_connect and renders login layout
// section: client_directive
"use client";

// section: imports
import { useEffect, useState } from "react";
import login_layout from "@/components/layouts/login";
import { createLayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "@/lib/hazo_connect_setup";
import { create_app_logger } from "@/lib/app_logger";
import type { LayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";

// section: types
type LoginPageClientProps = {
  redirectRoute?: string;
  successMessage?: string;
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
};

// section: component
export function LoginPageClient({
  redirectRoute,
  successMessage,
  alreadyLoggedInMessage,
  showLogoutButton,
  showReturnHomeButton,
  returnHomeButtonLabel,
  returnHomePath,
}: LoginPageClientProps) {
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
    return <div className="cls_login_page_loading text-slate-600">Loading...</div>;
  }

  const LoginLayout = login_layout;

  return (
    <LoginLayout
      image_src="/globe.svg"
      image_alt="Illustration of a globe representing secure authentication workflows"
      image_background_color="#e2e8f0"
      data_client={dataClient}
      logger={logger}
      redirectRoute={redirectRoute}
      successMessage={successMessage}
      alreadyLoggedInMessage={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
    />
  );
}

