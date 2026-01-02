import { jsx as _jsx } from "react/jsx-runtime";
// file_description: Zero-config MySettingsPage server component - drop in and use with no configuration required
// section: imports
import { get_my_settings_config } from "../lib/my_settings_config.server.js";
import MySettingsLayout from "../components/layouts/my_settings/index.js";
import { AuthPageShell } from "../components/layouts/shared/components/auth_page_shell.js";
// section: component
/**
 * Zero-config MySettingsPage server component
 *
 * This component initializes everything server-side:
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 * - User field visibility settings
 * - Password requirements
 * - Profile picture configuration
 * - UI messages and labels
 *
 * Usage in consuming apps:
 *
 * **As a full page:**
 * ```tsx
 * // app/settings/page.tsx
 * import { MySettingsPage } from "hazo_auth/pages/my_settings";
 *
 * export default function Page() {
 *   return <MySettingsPage />;
 * }
 * ```
 *
 * **Embedded in a dashboard:**
 * ```tsx
 * // app/dashboard/page.tsx
 * import { MySettingsPage } from "hazo_auth/pages/my_settings";
 *
 * export default function Page() {
 *   return (
 *     <div className="dashboard-container">
 *       <Sidebar />
 *       <main>
 *         <MySettingsPage className="max-w-4xl mx-auto" />
 *       </main>
 *     </div>
 *   );
 * }
 * ```
 *
 * Zero configuration required - works out of the box!
 * The component is fully embeddable and adapts to its container.
 *
 * @param props - Optional className for custom styling
 * @returns Server-rendered my settings component
 */
export default function MySettingsPage({ className, } = {}) {
    // Load configuration from INI file (with defaults)
    const config = get_my_settings_config();
    // Render layout with all server-initialized configuration, wrapped in AuthPageShell for navbar support
    return (_jsx(AuthPageShell, { children: _jsx(MySettingsLayout, { className: className, password_requirements: config.passwordRequirements, profilePicture: config.profilePicture, userFields: config.userFields, unauthorizedMessage: config.unauthorizedMessage, loginButtonLabel: config.loginButtonLabel, loginPath: config.loginPath, heading: config.heading, subHeading: config.subHeading, profilePhotoLabel: config.profilePhotoLabel, profilePhotoRecommendation: config.profilePhotoRecommendation, uploadPhotoButtonLabel: config.uploadPhotoButtonLabel, removePhotoButtonLabel: config.removePhotoButtonLabel, profileInformationLabel: config.profileInformationLabel, passwordLabel: config.passwordLabel, currentPasswordLabel: config.currentPasswordLabel, newPasswordLabel: config.newPasswordLabel, confirmPasswordLabel: config.confirmPasswordLabel, messages: config.messages, uiSizes: config.uiSizes, fileTypes: config.fileTypes }) }));
}
// Named export for direct imports
export { MySettingsPage };
