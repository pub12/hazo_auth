import { jsx as _jsx } from "react/jsx-runtime";
// file_description: Zero-config RegisterPage server component - drop in and use with no configuration required
// section: imports
import { get_hazo_connect_instance } from "../lib/hazo_connect_instance.server";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";
import { get_register_config } from "../lib/register_config.server";
import RegisterLayout from "../components/layouts/register";
// section: component
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
export default function RegisterPage({ image_src, image_alt, image_background_color, }) {
    // Initialize database connection server-side
    const hazoConnect = get_hazo_connect_instance();
    const dataClient = createLayoutDataClient(hazoConnect);
    // Load configuration from INI file (with defaults)
    const config = get_register_config();
    // Use props if provided, otherwise fall back to config
    const finalImageSrc = image_src || config.imageSrc || "/globe.svg";
    const finalImageAlt = image_alt || config.imageAlt || "Registration illustration";
    const finalImageBackgroundColor = image_background_color || config.imageBackgroundColor || "#e2e8f0";
    // Render layout with all server-initialized dependencies
    return (_jsx(RegisterLayout, { image_src: finalImageSrc, image_alt: finalImageAlt, image_background_color: finalImageBackgroundColor, data_client: dataClient, show_name_field: config.showNameField, password_requirements: config.passwordRequirements, alreadyLoggedInMessage: config.alreadyLoggedInMessage, showLogoutButton: config.showLogoutButton, showReturnHomeButton: config.showReturnHomeButton, returnHomeButtonLabel: config.returnHomeButtonLabel, returnHomePath: config.returnHomePath, signInPath: config.signInPath, signInLabel: config.signInLabel }));
}
