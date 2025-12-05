import type { StaticImageData } from "next/image";
export type LoginPageProps = {
    /**
     * Optional image source for the visual panel
     * Defaults from hazo_auth_config.ini or package default image
     */
    image_src?: string | StaticImageData;
    /**
     * Optional image alt text
     * Defaults to "Secure login illustration"
     */
    image_alt?: string;
    /**
     * Optional image background color
     * Defaults to "#f1f5f9"
     */
    image_background_color?: string;
};
/**
 * Zero-config LoginPage server component
 *
 * This component initializes everything server-side:
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 *
 * The data client and logger are initialized on the client side to avoid serialization issues.
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
export default function LoginPage({ image_src, image_alt, image_background_color, }?: LoginPageProps): import("react/jsx-runtime").JSX.Element;
export { LoginPage };
//# sourceMappingURL=login.d.ts.map