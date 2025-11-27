// file_description: zero-config forgot password page component for hazo_auth
// Consumers can use this directly without needing to configure props
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// section: imports
import { useEffect, useState } from "react";
import forgot_password_layout from "../components/layouts/forgot_password";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup";
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
