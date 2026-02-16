// file_description: main entry point for hazo_auth package - client-safe exports only
// This entry point is safe for use in client components (browser)
// For server-side code, use "hazo_auth/server-lib" instead
//
// BREAKING CHANGE (v5.2.0): Server-only exports moved to "hazo_auth/server-lib"
// Migration: import { hazo_get_auth, get_login_config } from "hazo_auth/server-lib";
// section: context_exports
export * from "./contexts/hazo_auth_provider.js";
export * from "./contexts/hazo_auth_config.js";
// section: component_exports
export * from "./components/index.js";
export { AuthenticationRequiredError, TenantRequiredError, TenantAccessDeniedError, } from "./lib/auth/auth_types.js";
// section: utility_exports (client-safe)
export { cn, merge_class_names } from "./lib/utils.js";
// section: constant_exports
export { HAZO_AUTH_PERMISSIONS, ALL_ADMIN_PERMISSIONS } from "./lib/constants.js";
