import "server-only";
export type MySettingsPageProps = {
    /**
     * Optional className for custom styling
     */
    className?: string;
};
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
export default function MySettingsPage({ className, }?: MySettingsPageProps): import("react/jsx-runtime").JSX.Element;
export { MySettingsPage };
//# sourceMappingURL=my_settings.d.ts.map