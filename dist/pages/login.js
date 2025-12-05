import { jsx as _jsx } from "react/jsx-runtime";
// file_description: Zero-config LoginPage server component - drop in and use with no configuration required
// section: imports
import { get_hazo_connect_instance } from "../lib/hazo_connect_instance.server";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { get_login_config } from "../lib/login_config.server";
import { create_app_logger } from "../lib/app_logger";
import LoginLayout from "../components/layouts/login";
import { DEFAULT_UI_SHELL } from "../lib/config/default_config";
// section: component
/**
 * Zero-config LoginPage server component
 *
 * This component initializes everything server-side:
 * - Database connection via hazo_connect singleton
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 * - Logger instance
 * - Layout data client
 *
 * Usage in consuming apps:
 * ```tsx
 * // app/login/page.tsx
 * import { LoginPage } from "hazo_auth/pages/login";
 *
 * export default function Page() {
 *   return <LoginPage />;
 * }
 * ```
 *
 * Zero configuration required - works out of the box!
 *
 * @param props - Optional visual customization props
 * @returns Server-rendered login page
 */
export default function LoginPage({ image_src = DEFAULT_UI_SHELL.image_src, image_alt = "Login illustration", image_background_color = "#f1f5f9", }) {
    // Initialize database connection server-side
    const hazoConnect = get_hazo_connect_instance();
    const dataClient = createLayoutDataClient(hazoConnect);
    // Load configuration from INI file (with defaults)
    const config = get_login_config();
    // Create logger instance
    const logger = create_app_logger();
    // Render layout with all server-initialized dependencies
    return (_jsx(LoginLayout, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, data_client: dataClient, logger: logger, redirectRoute: config.redirectRoute, successMessage: config.successMessage, alreadyLoggedInMessage: config.alreadyLoggedInMessage, showLogoutButton: config.showLogoutButton, showReturnHomeButton: config.showReturnHomeButton, returnHomeButtonLabel: config.returnHomeButtonLabel, returnHomePath: config.returnHomePath, forgot_password_path: config.forgotPasswordPath, forgot_password_label: config.forgotPasswordLabel, create_account_path: config.createAccountPath, create_account_label: config.createAccountLabel }));
}
