// file_description: Client wrapper for ForgotPasswordLayout - handles data client initialization on client side
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// section: imports
import { useEffect, useState } from "react";
import ForgotPasswordLayout from "../components/layouts/forgot_password";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup";
// section: component
/**
 * Client wrapper for ForgotPasswordLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export function ForgotPasswordClientWrapper({ image_src, image_alt, image_background_color, sign_in_path, sign_in_label, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, }) {
    const [dataClient, setDataClient] = useState(null);
    useEffect(() => {
        // Initialize hazo_connect on client side
        const hazoConnect = create_sqlite_hazo_connect();
        const client = createLayoutDataClient(hazoConnect);
        setDataClient(client);
    }, []);
    // Show loading state while initializing
    if (!dataClient) {
        return (_jsx("div", { className: "cls_forgot_password_page_loading flex items-center justify-center min-h-screen", children: _jsx("div", { className: "text-slate-600 animate-pulse", children: "Loading..." }) }));
    }
    return (_jsx(ForgotPasswordLayout, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, data_client: dataClient, sign_in_path: sign_in_path, sign_in_label: sign_in_label, alreadyLoggedInMessage: alreadyLoggedInMessage, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath }));
}
