// file_description: Barrel export for all zero-config page components
// section: exports
/**
 * Zero-config page components for hazo_auth v2.0+
 *
 * These are server components that initialize everything on the server:
 * - Database connection via hazo_connect singleton
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 * - All required dependencies and props
 *
 * Usage in consuming apps:
 * ```tsx
 * // app/login/page.tsx
 * import { LoginPage } from "hazo_auth/pages";
 *
 * export default function Page() {
 *   return <LoginPage />;
 * }
 * ```
 *
 * All pages work out-of-the-box with ZERO configuration required!
 */
export { default as LoginPage } from "./login";
export { default as RegisterPage } from "./register";
export { default as VerifyEmailPage } from "./verify_email";
export { default as ForgotPasswordPage } from "./forgot_password";
export { default as ResetPasswordPage } from "./reset_password";
export { default as MySettingsPage } from "./my_settings";
