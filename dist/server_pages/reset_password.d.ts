import "server-only";
import type { StaticImageData } from "next/image";
export type ResetPasswordPageProps = {
    /**
     * Optional image source for the visual panel
     * Defaults from hazo_auth_config.ini or package default image
     */
    image_src?: string | StaticImageData;
    /**
     * Optional image alt text
     * Defaults to "Reset password illustration"
     */
    image_alt?: string;
    /**
     * Optional image background color
     * Defaults to "#f1f5f9"
     */
    image_background_color?: string;
};
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
export default function ResetPasswordPage({ image_src, image_alt, image_background_color, }?: ResetPasswordPageProps): import("react/jsx-runtime").JSX.Element;
export { ResetPasswordPage };
//# sourceMappingURL=reset_password.d.ts.map