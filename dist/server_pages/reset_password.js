import { jsx as _jsx } from "react/jsx-runtime";
// file_description: Zero-config ResetPasswordPage server component - drop in and use with no configuration required
// section: imports
import { get_reset_password_config } from "../lib/reset_password_config.server.js";
import { ResetPasswordClientWrapper } from "./reset_password_client_wrapper.js";
import { AuthPageShell } from "../components/layouts/shared/components/auth_page_shell.js";
// section: component
/**
 * Zero-config ResetPasswordPage server component
 *
 * This component initializes everything server-side:
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 * - Password requirements
 *
 * The data client is initialized on the client side to avoid serialization issues.
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
export default function ResetPasswordPage({ image_src, image_alt, image_background_color, } = {}) {
    // Load configuration from INI file (with defaults including asset images)
    const config = get_reset_password_config();
    // Use props if provided, otherwise fall back to config (which includes default asset image)
    const finalImageSrc = image_src || config.imageSrc;
    const finalImageAlt = image_alt || config.imageAlt;
    const finalImageBackgroundColor = image_background_color || config.imageBackgroundColor;
    // Pass serializable config to client wrapper, wrapped in AuthPageShell for navbar support
    return (_jsx(AuthPageShell, { children: _jsx(ResetPasswordClientWrapper, { image_src: finalImageSrc, image_alt: finalImageAlt, image_background_color: finalImageBackgroundColor, passwordRequirements: config.passwordRequirements, errorMessage: config.errorMessage, successMessage: config.successMessage, loginPath: config.loginPath, forgotPasswordPath: config.forgotPasswordPath, alreadyLoggedInMessage: config.alreadyLoggedInMessage, showLogoutButton: config.showLogoutButton, showReturnHomeButton: config.showReturnHomeButton, returnHomeButtonLabel: config.returnHomeButtonLabel, returnHomePath: config.returnHomePath }) }));
}
// Named export for direct imports
export { ResetPasswordPage };
