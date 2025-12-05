export type ForgotPasswordPageProps = {
    /**
     * Optional image source for the visual panel
     * @default "/globe.svg" (from default_config.ts)
     */
    image_src?: string;
    /**
     * Optional image alt text
     * @default "Password recovery illustration"
     */
    image_alt?: string;
    /**
     * Optional image background color
     * @default "#f1f5f9"
     */
    image_background_color?: string;
    /**
     * Optional path to sign in page
     * @default "/hazo_auth/login" (from default_config.ts)
     */
    sign_in_path?: string;
    /**
     * Optional sign in link label
     * @default "Back to login" (from default_config.ts)
     */
    sign_in_label?: string;
};
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
export default function ForgotPasswordPage({ image_src, image_alt, image_background_color, sign_in_path, sign_in_label, }: ForgotPasswordPageProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=forgot_password.d.ts.map