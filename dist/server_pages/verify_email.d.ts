import type { StaticImageData } from "next/image";
export type VerifyEmailPageProps = {
    /**
     * Optional image source for the visual panel
     * Defaults from hazo_auth_config.ini or package default image
     */
    image_src?: string | StaticImageData;
    /**
     * Optional image alt text
     * Defaults to "Email verification illustration"
     */
    image_alt?: string;
    /**
     * Optional image background color
     * Defaults to "#f1f5f9"
     */
    image_background_color?: string;
    /**
     * Optional redirect delay in seconds after successful verification
     * Defaults from DEFAULT_EMAIL_VERIFICATION.redirectDelay
     */
    redirect_delay?: number;
    /**
     * Optional login path for redirect
     * Defaults from DEFAULT_EMAIL_VERIFICATION.loginPath
     */
    login_path?: string;
};
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
export default function VerifyEmailPage({ image_src, image_alt, image_background_color, redirect_delay, login_path, }?: VerifyEmailPageProps): import("react/jsx-runtime").JSX.Element;
export { VerifyEmailPage };
//# sourceMappingURL=verify_email.d.ts.map