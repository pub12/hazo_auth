// file_description: zero-config forgot password page component for hazo_auth
// Consumers can use this directly without needing to configure props
//
// ⚠️ DEPRECATED: This client component is deprecated in hazo_auth v2.0+
// Please use the new server component version instead:
//
// import { ForgotPasswordPage } from "hazo_auth/pages/forgot_password";
//
// The new version:
// - Initializes on the server (no loading state)
// - Works with your app's hazo_connect instance
// - True zero-config "drop in and use"
// - Better performance (smaller bundle)
//
// This file will be removed in v3.0
//
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// section: imports
import { useEffect, useState } from "react";
import forgot_password_layout from "../components/layouts/forgot_password/index.js";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client.js";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup.js";
// section: constants
const DEFAULT_IMAGE_SRC = "/globe.svg";
const DEFAULT_IMAGE_ALT = "Illustration of a globe representing secure authentication workflows";
const DEFAULT_IMAGE_BG = "#e2e8f0";
// section: component
/**
 * Zero-config forgot password page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Forgot password page component
 */
export function ForgotPasswordPage({ alreadyLoggedInMessage = "You are already logged in", showLogoutButton = true, showReturnHomeButton = false, returnHomeButtonLabel = "Return home", returnHomePath = "/", imageSrc = DEFAULT_IMAGE_SRC, imageAlt = DEFAULT_IMAGE_ALT, imageBackgroundColor = DEFAULT_IMAGE_BG, } = {}) {
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
    const ForgotPasswordLayout = forgot_password_layout;
    return (_jsx(ForgotPasswordLayout, { image_src: imageSrc, image_alt: imageAlt, image_background_color: imageBackgroundColor, data_client: dataClient, alreadyLoggedInMessage: alreadyLoggedInMessage, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath }));
}
export default ForgotPasswordPage;
