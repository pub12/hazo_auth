// file_description: React Context Provider for hazo_auth runtime configuration
// Provides global configuration for API paths and other runtime settings
// Must be used as a wrapper in consuming apps for customizing API endpoints
// section: imports
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useMemo } from "react";
import { DEFAULT_HAZO_AUTH_CONFIG } from "./hazo_auth_config";
// section: context_definition
/**
 * React Context for hazo_auth configuration
 * @internal
 */
const HazoAuthConfigContext = createContext(DEFAULT_HAZO_AUTH_CONFIG);
// section: provider_component
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
export function HazoAuthProvider({ apiBasePath = DEFAULT_HAZO_AUTH_CONFIG.apiBasePath, children }) {
    // Memoize config to avoid unnecessary re-renders
    const config = useMemo(() => ({
        apiBasePath,
    }), [apiBasePath]);
    return (_jsx(HazoAuthConfigContext.Provider, { value: config, children: children }));
}
// section: hook
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
export function useHazoAuthConfig() {
    const context = useContext(HazoAuthConfigContext);
    // Context will always have a value (either from provider or default)
    // No need to check for undefined
    return context;
}
