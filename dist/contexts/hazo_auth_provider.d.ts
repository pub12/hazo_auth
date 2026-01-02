import { type ReactNode } from "react";
import { type HazoAuthConfig } from "./hazo_auth_config.js";
/**
 * Props for HazoAuthProvider component
 */
export type HazoAuthProviderProps = {
    /**
     * Base path for all hazo_auth API endpoints
     * @default "/api/hazo_auth"
     * @example "/api/v1/auth" - Custom API path
     */
    apiBasePath?: string;
    /**
     * Child components that will have access to the configuration
     */
    children: ReactNode;
};
/**
 * Context Provider for hazo_auth runtime configuration
 *
 * Wrap your app (or specific parts) with this provider to customize
 * API paths and other runtime settings for all hazo_auth components.
 *
 * @example
 * ```tsx
 * // In your root layout or app component
 * import { HazoAuthProvider } from "hazo_auth/provider";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <HazoAuthProvider apiBasePath="/api/v1/auth">
 *           {children}
 *         </HazoAuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using default values (no provider needed)
 * // All components will use "/api/hazo_auth" as the base path
 * export default function App() {
 *   return <LoginPage />;
 * }
 * ```
 */
export declare function HazoAuthProvider({ apiBasePath, children }: HazoAuthProviderProps): import("react/jsx-runtime").JSX.Element;
/**
 * Hook to access hazo_auth runtime configuration
 *
 * Returns the current configuration from the nearest HazoAuthProvider,
 * or default values if no provider is present.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { apiBasePath } = useHazoAuthConfig();
 *
 *   const response = await fetch(`${apiBasePath}/login`, {
 *     method: "POST",
 *     body: JSON.stringify({ email, password }),
 *   });
 * }
 * ```
 *
 * @returns Current HazoAuthConfig
 */
export declare function useHazoAuthConfig(): HazoAuthConfig;
//# sourceMappingURL=hazo_auth_provider.d.ts.map