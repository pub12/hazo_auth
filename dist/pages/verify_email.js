import { jsx as _jsx } from "react/jsx-runtime";
// file_description: Zero-config VerifyEmailPage server component - drop in and use with no configuration required
// section: imports
import { get_hazo_connect_instance } from "../lib/hazo_connect_instance.server";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { get_email_verification_config } from "../lib/email_verification_config.server";
import EmailVerificationLayout from "../components/layouts/email_verification";
import { DEFAULT_UI_SHELL, DEFAULT_EMAIL_VERIFICATION } from "../lib/config/default_config";
// section: component
/**
 * Zero-config VerifyEmailPage server component
 *
 * This component initializes everything server-side:
 * - Database connection via hazo_connect singleton
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 * - Layout data client
 *
 * Usage in consuming apps:
 * ```tsx
 * // app/verify-email/page.tsx
 * import { VerifyEmailPage } from "hazo_auth/pages/verify_email";
 *
 * export default function Page() {
 *   return <VerifyEmailPage />;
 * }
 * ```
 *
 * Zero configuration required - works out of the box!
 *
 * @param props - Optional visual and behavior customization props
 * @returns Server-rendered email verification page
 */
export default function VerifyEmailPage({ image_src = DEFAULT_UI_SHELL.image_src, image_alt = "Email verification illustration", image_background_color = "#f1f5f9", redirect_delay = DEFAULT_EMAIL_VERIFICATION.redirectDelay, login_path = DEFAULT_EMAIL_VERIFICATION.loginPath, }) {
    // Initialize database connection server-side
    const hazoConnect = get_hazo_connect_instance();
    const dataClient = createLayoutDataClient(hazoConnect);
    // Load configuration from INI file (with defaults)
    const config = get_email_verification_config();
    // Render layout with all server-initialized dependencies
    return (_jsx(EmailVerificationLayout, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, data_client: dataClient, redirect_delay: redirect_delay, login_path: login_path, sign_in_label: "Back to login", already_logged_in_message: config.alreadyLoggedInMessage, showLogoutButton: config.showLogoutButton, showReturnHomeButton: config.showReturnHomeButton, returnHomeButtonLabel: config.returnHomeButtonLabel, returnHomePath: config.returnHomePath }));
}
