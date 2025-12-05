// file_description: Barrel export for all zero-config page components

export { default as LoginPage } from "./login";
export { default as RegisterPage } from "./register";
export { default as ForgotPasswordPage } from "./forgot_password";
export { default as ResetPasswordPage } from "./reset_password";
export { default as VerifyEmailPage } from "./verify_email";
export { default as MySettingsPage } from "./my_settings";

// Re-export types
export type { LoginPageProps } from "./login";
export type { RegisterPageProps } from "./register";
export type { ForgotPasswordPageProps } from "./forgot_password";
export type { ResetPasswordPageProps } from "./reset_password";
export type { VerifyEmailPageProps } from "./verify_email";
export type { MySettingsPageProps } from "./my_settings";
