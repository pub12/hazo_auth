import { jsx as _jsx } from "react/jsx-runtime";
// file_description: Zero-config ResetPasswordPage server component - drop in and use with no configuration required
// section: imports
import { get_hazo_connect_instance } from "../lib/hazo_connect_instance.server";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { get_reset_password_config } from "../lib/reset_password_config.server";
import ResetPasswordLayout from "../components/layouts/reset_password";
import { DEFAULT_UI_SHELL } from "../lib/config/default_config";
// section: component
/**
 * Zero-config ResetPasswordPage server component
 *
 * This component initializes everything server-side:
 * - Database connection via hazo_connect singleton
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 * - Password requirements
 * - Layout data client
 *
 * Usage in consuming apps:
 * ```tsx
 * // app/reset-password/page.tsx
 * import { ResetPasswordPage } from "hazo_auth/pages/reset_password";
 *
 * export default function Page() {
 *   return <ResetPasswordPage />;
 * }
 * ```
 *
 * Zero configuration required - works out of the box!
 *
 * @param props - Optional visual customization props
 * @returns Server-rendered reset password page
 */
export default function ResetPasswordPage({ image_src = DEFAULT_UI_SHELL.image_src, image_alt = "Reset password illustration", image_background_color = "#f1f5f9", }) {
    // Initialize database connection server-side
    const hazoConnect = get_hazo_connect_instance();
    const dataClient = createLayoutDataClient(hazoConnect);
    // Load configuration from INI file (with defaults)
    const config = get_reset_password_config();
    // Render layout with all server-initialized dependencies
    return (_jsx(ResetPasswordLayout, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, data_client: dataClient, password_requirements: config.passwordRequirements, errorMessage: config.errorMessage, successMessage: config.successMessage, loginPath: config.loginPath, forgotPasswordPath: config.forgotPasswordPath, alreadyLoggedInMessage: config.alreadyLoggedInMessage, showLogoutButton: config.showLogoutButton, showReturnHomeButton: config.showReturnHomeButton, returnHomeButtonLabel: config.returnHomeButtonLabel, returnHomePath: config.returnHomePath }));
}
