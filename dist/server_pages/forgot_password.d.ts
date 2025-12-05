import type { StaticImageData } from "next/image";
export type ForgotPasswordPageProps = {
    /**
     * Optional image source for the visual panel
     * Defaults from hazo_auth_config.ini or package default image
     */
    image_src?: string | StaticImageData;
    /**
     * Optional image alt text
     * Defaults to "Password recovery illustration"
     */
    image_alt?: string;
    /**
     * Optional image background color
     * Defaults to "#f1f5f9"
     */
    image_background_color?: string;
    /**
     * Optional sign in path
     * Defaults from DEFAULT_FORGOT_PASSWORD.loginPath
     */
    sign_in_path?: string;
    /**
     * Optional sign in label
     * Defaults from DEFAULT_FORGOT_PASSWORD.loginLabel
     */
    sign_in_label?: string;
};
/**
 * Zero-config ForgotPasswordPage server component
 *
 * This component initializes everything server-side:
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 *
 * The data client is initialized on the client side to avoid serialization issues.
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
export default function ForgotPasswordPage({ image_src, image_alt, image_background_color, sign_in_path, sign_in_label, }?: ForgotPasswordPageProps): import("react/jsx-runtime").JSX.Element;
export { ForgotPasswordPage };
//# sourceMappingURL=forgot_password.d.ts.map