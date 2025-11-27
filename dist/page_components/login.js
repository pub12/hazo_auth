// file_description: zero-config login page component for hazo_auth
// Consumers can use this directly without needing to configure props
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// section: imports
import { useEffect, useState } from "react";
import login_layout from "../components/layouts/login";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { create_sqlite_hazo_connect } from "../lib/hazo_connect_setup";
import { create_app_logger } from "../lib/app_logger";
// section: constants
const DEFAULT_IMAGE_SRC = "/globe.svg";
const DEFAULT_IMAGE_ALT = "Illustration of a globe representing secure authentication workflows";
const DEFAULT_IMAGE_BG = "#e2e8f0";
// section: component
/**
 * Zero-config login page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Login page component
 */
export function LoginPage({ redirectRoute, successMessage = "Successfully logged in", alreadyLoggedInMessage = "You are already logged in", showLogoutButton = true, showReturnHomeButton = false, returnHomeButtonLabel = "Return home", returnHomePath = "/", forgotPasswordPath = "/hazo_auth/forgot_password", forgotPasswordLabel = "Forgot password?", createAccountPath = "/hazo_auth/register", createAccountLabel = "Create account", urlOnLogon, imageSrc = DEFAULT_IMAGE_SRC, imageAlt = DEFAULT_IMAGE_ALT, imageBackgroundColor = DEFAULT_IMAGE_BG, } = {}) {
    const [dataClient, setDataClient] = useState(null);
    const [logger, setLogger] = useState(null);
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
        return (_jsx("div", { className: "cls_login_page_loading flex items-center justify-center min-h-screen", children: _jsx("div", { className: "text-slate-600 animate-pulse", children: "Loading..." }) }));
    }
    const LoginLayout = login_layout;
    return (_jsx(LoginLayout, { image_src: imageSrc, image_alt: imageAlt, image_background_color: imageBackgroundColor, data_client: dataClient, logger: logger, redirectRoute: redirectRoute, successMessage: successMessage, alreadyLoggedInMessage: alreadyLoggedInMessage, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath, forgot_password_path: forgotPasswordPath, forgot_password_label: forgotPasswordLabel, create_account_path: createAccountPath, create_account_label: createAccountLabel, urlOnLogon: urlOnLogon }));
}
export default LoginPage;
