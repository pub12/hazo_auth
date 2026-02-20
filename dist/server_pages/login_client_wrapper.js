// file_description: Client wrapper for LoginLayout - handles data client initialization on client side
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// section: imports
import { useEffect, useState } from "react";
import LoginLayout from "../components/layouts/login/index.js";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client.js";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup.js";
// section: component
/**
 * Client wrapper for LoginLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export function LoginClientWrapper({ image_src, image_alt, image_background_color, redirectRoute, successMessage, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, forgotPasswordPath, forgotPasswordLabel, createAccountPath, createAccountLabel, showCreateAccountLink = true, oauth, }) {
    const [dataClient, setDataClient] = useState(null);
    useEffect(() => {
        // Initialize hazo_connect on client side
        const hazoConnect = create_sqlite_hazo_connect();
        const client = createLayoutDataClient(hazoConnect);
        setDataClient(client);
    }, []);
    // Show loading state while initializing
    if (!dataClient) {
        return (_jsx("div", { className: "cls_login_page_loading flex items-center justify-center min-h-screen", children: _jsx("div", { className: "text-slate-600 animate-pulse", children: "Loading..." }) }));
    }
    return (_jsx(LoginLayout, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, data_client: dataClient, redirectRoute: redirectRoute, successMessage: successMessage, alreadyLoggedInMessage: alreadyLoggedInMessage, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath, forgot_password_path: forgotPasswordPath, forgot_password_label: forgotPasswordLabel, create_account_path: createAccountPath, create_account_label: createAccountLabel, show_create_account_link: showCreateAccountLink, oauth: oauth }));
}
