// file_description: Client wrapper for EmailVerificationLayout - handles data client initialization on client side
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// section: imports
import { useEffect, useState } from "react";
import EmailVerificationLayout from "../components/layouts/email_verification.js";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client.js";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup.js";
// section: component
/**
 * Client wrapper for EmailVerificationLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export function VerifyEmailClientWrapper({ image_src, image_alt, image_background_color, redirect_delay, login_path, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, }) {
    const [dataClient, setDataClient] = useState(null);
    useEffect(() => {
        // Initialize hazo_connect on client side
        const hazoConnect = create_sqlite_hazo_connect();
        const client = createLayoutDataClient(hazoConnect);
        setDataClient(client);
    }, []);
    // Show loading state while initializing
    if (!dataClient) {
        return (_jsx("div", { className: "cls_verify_email_page_loading flex items-center justify-center min-h-screen", children: _jsx("div", { className: "text-slate-600 animate-pulse", children: "Loading..." }) }));
    }
    return (_jsx(EmailVerificationLayout, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, data_client: dataClient, redirect_delay: redirect_delay, login_path: login_path, sign_in_label: "Back to login", already_logged_in_message: alreadyLoggedInMessage, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath }));
}
