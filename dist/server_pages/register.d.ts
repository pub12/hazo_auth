import "server-only";
import type { StaticImageData } from "next/image";
export type RegisterPageProps = {
    /**
     * Optional image source for the visual panel
     * Defaults from hazo_auth_config.ini or package default image
     */
    image_src?: string | StaticImageData;
    /**
     * Optional image alt text
     * Defaults from hazo_auth_config.ini or "Modern building representing user registration"
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
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 * - Password requirements
 * - User field visibility
 *
 * The data client is initialized on the client side to avoid serialization issues.
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
export default function RegisterPage({ image_src, image_alt, image_background_color, }?: RegisterPageProps): import("react/jsx-runtime").JSX.Element;
export { RegisterPage };
//# sourceMappingURL=register.d.ts.map