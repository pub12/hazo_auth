// file_description: client-safe exports for hazo_auth package
// This file exports only modules that are safe to use in client components (browser)
// It excludes any server-side Node.js dependencies (fs, path, database, etc.)
//
// USAGE:
// import { ProfilePicMenu, use_auth_status, cn } from "hazo_auth/client";
//
// For server-side code (API routes, Server Components), use:
// import { hazo_get_auth, get_config_value } from "hazo_auth";
// section: component_exports
// All UI and layout components are client-safe
export * from "./components/index";
// section: utility_exports
// CSS utility functions
export { cn, merge_class_names } from "./lib/utils";
// section: type_exports
// Type definitions are always safe (erased at runtime)
export * from "./lib/auth/auth_types";
// section: client_hook_exports
// Re-export from shared hooks (these are already "use client" components)
export { use_auth_status, trigger_auth_status_refresh } from "./components/layouts/shared/hooks/use_auth_status";
export { use_hazo_auth, trigger_hazo_auth_refresh } from "./components/layouts/shared/hooks/use_hazo_auth";
export { use_firm_branding, use_current_user_branding } from "./components/layouts/shared/hooks/use_firm_branding";
// section: validation_exports
// Client-side validation utilities
export * from "./components/layouts/shared/utils/validation";
