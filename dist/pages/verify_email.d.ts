export type VerifyEmailPageProps = {
    /**
     * Optional image source for the visual panel
     * @default "/globe.svg" (from default_config.ts)
     */
    image_src?: string;
    /**
     * Optional image alt text
     * @default "Email verification illustration"
     */
    image_alt?: string;
    /**
     * Optional image background color
     * @default "#f1f5f9"
     */
    image_background_color?: string;
    /**
     * Optional redirect delay in seconds after successful verification
     * @default 5 (from default_config.ts)
     */
    redirect_delay?: number;
    /**
     * Optional path to login page
     * @default "/hazo_auth/login" (from default_config.ts)
     */
    login_path?: string;
};
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
export default function VerifyEmailPage({ image_src, image_alt, image_background_color, redirect_delay, login_path, }: VerifyEmailPageProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=verify_email.d.ts.map