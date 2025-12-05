export type RegisterPageProps = {
    /**
     * Optional image source for the visual panel
     * Defaults from hazo_auth_config.ini or "/globe.svg"
     */
    image_src?: string;
    /**
     * Optional image alt text
     * Defaults from hazo_auth_config.ini or "Registration illustration"
     */
    image_alt?: string;
    /**
     * Optional image background color
     * Defaults from hazo_auth_config.ini or "#e2e8f0"
     */
    image_background_color?: string;
};
/**
 * Zero-config RegisterPage server component
 *
 * This component initializes everything server-side:
 * - Database connection via hazo_connect singleton
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 * - Password requirements
 * - User field visibility
 * - Layout data client
 *
 * Usage in consuming apps:
 * ```tsx
 * // app/register/page.tsx
 * import { RegisterPage } from "hazo_auth/pages/register";
 *
 * export default function Page() {
 *   return <RegisterPage />;
 * }
 * ```
 *
 * Zero configuration required - works out of the box!
 *
 * @param props - Optional visual customization props
 * @returns Server-rendered register page
 */
export default function RegisterPage({ image_src, image_alt, image_background_color, }: RegisterPageProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=register.d.ts.map