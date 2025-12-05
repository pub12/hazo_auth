export type LoginPageProps = {
    /**
     * Optional image source for the visual panel
     * @default "/globe.svg" (from default_config.ts)
     */
    image_src?: string;
    /**
     * Optional image alt text
     * @default "Login illustration"
     */
    image_alt?: string;
    /**
     * Optional image background color
     * @default "#f1f5f9"
     */
    image_background_color?: string;
};
/**
 * Zero-config LoginPage server component
 *
 * This component initializes everything server-side:
 * - Database connection via hazo_connect singleton
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 * - Logger instance
 * - Layout data client
 *
 * Usage in consuming apps:
 * ```tsx
 * // app/login/page.tsx
 * import { LoginPage } from "hazo_auth/pages/login";
 *
 * export default function Page() {
 *   return <LoginPage />;
 * }
 * ```
 *
 * Zero configuration required - works out of the box!
 *
 * @param props - Optional visual customization props
 * @returns Server-rendered login page
 */
export default function LoginPage({ image_src, image_alt, image_background_color, }: LoginPageProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=login.d.ts.map