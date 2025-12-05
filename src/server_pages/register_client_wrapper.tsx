// file_description: Client wrapper for RegisterLayout - handles data client initialization on client side
"use client";

// section: imports
import { useEffect, useState } from "react";
import RegisterLayout from "../components/layouts/register";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup";
import type { LayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import type { RegisterConfig } from "../lib/register_config.server";

// section: types
export type RegisterClientWrapperProps = RegisterConfig & {
  image_src: string;
  image_alt: string;
  image_background_color: string;
};

// section: component
/**
 * Client wrapper for RegisterLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export function RegisterClientWrapper({
  image_src,
  image_alt,
  image_background_color,
  showNameField,
  passwordRequirements,
  alreadyLoggedInMessage,
  showLogoutButton,
  showReturnHomeButton,
  returnHomeButtonLabel,
  returnHomePath,
  signInPath,
  signInLabel,
}: RegisterClientWrapperProps) {
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

  return (
    <RegisterLayout
      image_src={image_src}
      image_alt={image_alt}
      image_background_color={image_background_color}
      data_client={dataClient}
      show_name_field={showNameField}
      password_requirements={passwordRequirements}
      alreadyLoggedInMessage={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
      signInPath={signInPath}
      signInLabel={signInLabel}
    />
  );
}
