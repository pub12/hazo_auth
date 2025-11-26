// file_description: barrel export for all layout components
// section: layout_exports
export { default as LoginLayout } from "./login/index";
export type { LoginLayoutProps } from "./login/index";

export { default as RegisterLayout } from "./register/index";
export type { RegisterLayoutProps } from "./register/index";

export { default as ForgotPasswordLayout } from "./forgot_password/index";
export type { ForgotPasswordLayoutProps } from "./forgot_password/index";

export { default as ResetPasswordLayout } from "./reset_password/index";
export type { ResetPasswordLayoutProps } from "./reset_password/index";

export { default as EmailVerificationLayout } from "./email_verification/index";
export type { EmailVerificationLayoutProps } from "./email_verification/index";

export { default as MySettingsLayout } from "./my_settings/index";
export type { MySettingsLayoutProps } from "./my_settings/index";

export { UserManagementLayout } from "./user_management/index";
export type { UserManagementLayoutProps } from "./user_management/index";

// section: shared_exports
export * from "./shared/index";

