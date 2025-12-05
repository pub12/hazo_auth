import { jsx as _jsx } from "react/jsx-runtime";
// file_description: Zero-config ForgotPasswordPage server component - drop in and use with no configuration required
// section: imports
import { get_hazo_connect_instance } from "../lib/hazo_connect_instance.server";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { get_forgot_password_config } from "../lib/forgot_password_config.server";
import ForgotPasswordLayout from "../components/layouts/forgot_password";
import { DEFAULT_UI_SHELL, DEFAULT_FORGOT_PASSWORD } from "../lib/config/default_config";
// section: component
/**
 * Zero-config ForgotPasswordPage server component
 *
 * This component initializes everything server-side:
 * - Database connection via hazo_connect singleton
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 * - Layout data client
 *
 * Usage in consuming apps:
 * ```tsx
 * // app/forgot-password/page.tsx
 * import { ForgotPasswordPage } from "hazo_auth/pages/forgot_password";
 *
 * export default function Page() {
 *   return <ForgotPasswordPage />;
 * }
 * ```
 *
 * Zero configuration required - works out of the box!
 *
 * @param props - Optional visual and navigation customization props
 * @returns Server-rendered forgot password page
 */
export default function ForgotPasswordPage({ image_src = DEFAULT_UI_SHELL.image_src, image_alt = "Password recovery illustration", image_background_color = "#f1f5f9", sign_in_path = DEFAULT_FORGOT_PASSWORD.loginPath, sign_in_label = DEFAULT_FORGOT_PASSWORD.loginLabel, }) {
    // Initialize database connection server-side
    const hazoConnect = get_hazo_connect_instance();
    const dataClient = createLayoutDataClient(hazoConnect);
    // Load configuration from INI file (with defaults)
    const config = get_forgot_password_config();
    // Render layout with all server-initialized dependencies
    return (_jsx(ForgotPasswordLayout, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, data_client: dataClient, sign_in_path: sign_in_path, sign_in_label: sign_in_label, alreadyLoggedInMessage: config.alreadyLoggedInMessage, showLogoutButton: config.showLogoutButton, showReturnHomeButton: config.showReturnHomeButton, returnHomeButtonLabel: config.returnHomeButtonLabel, returnHomePath: config.returnHomePath }));
}
