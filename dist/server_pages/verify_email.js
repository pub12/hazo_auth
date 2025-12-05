import { jsx as _jsx } from "react/jsx-runtime";
// file_description: Zero-config VerifyEmailPage server component - drop in and use with no configuration required
// section: imports
import { get_email_verification_config } from "../lib/email_verification_config.server";
import { VerifyEmailClientWrapper } from "./verify_email_client_wrapper";
import { DEFAULT_EMAIL_VERIFICATION } from "../lib/config/default_config";
// section: component
/**
 * Zero-config VerifyEmailPage server component
 *
 * This component initializes everything server-side:
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 *
 * The data client is initialized on the client side to avoid serialization issues.
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
export default function VerifyEmailPage({ image_src, image_alt, image_background_color, redirect_delay = DEFAULT_EMAIL_VERIFICATION.redirectDelay, login_path = DEFAULT_EMAIL_VERIFICATION.loginPath, } = {}) {
    // Load configuration from INI file (with defaults including asset images)
    const config = get_email_verification_config();
    // Use props if provided, otherwise fall back to config (which includes default asset image)
    const finalImageSrc = image_src || config.imageSrc;
    const finalImageAlt = image_alt || config.imageAlt;
    const finalImageBackgroundColor = image_background_color || config.imageBackgroundColor;
    // Pass serializable config to client wrapper
    return (_jsx(VerifyEmailClientWrapper, { image_src: finalImageSrc, image_alt: finalImageAlt, image_background_color: finalImageBackgroundColor, redirect_delay: redirect_delay, login_path: login_path, alreadyLoggedInMessage: config.alreadyLoggedInMessage, showLogoutButton: config.showLogoutButton, showReturnHomeButton: config.showReturnHomeButton, returnHomeButtonLabel: config.returnHomeButtonLabel, returnHomePath: config.returnHomePath }));
}
