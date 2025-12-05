export type ResetPasswordPageProps = {
    /**
     * Optional image source for the visual panel
     * @default "/globe.svg" (from default_config.ts)
     */
    image_src?: string;
    /**
     * Optional image alt text
     * @default "Reset password illustration"
     */
    image_alt?: string;
    /**
     * Optional image background color
     * @default "#f1f5f9"
     */
    image_background_color?: string;
};
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
export default function ResetPasswordPage({ image_src, image_alt, image_background_color, }: ResetPasswordPageProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=reset_password.d.ts.map