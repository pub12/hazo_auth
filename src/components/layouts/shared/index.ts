// file_description: barrel export for shared layout components, hooks, and utilities
// section: component_exports
export { AlreadyLoggedInGuard } from "./components/already_logged_in_guard";
// AuthPageShell - NOT exported (test workspace component only)
export { FieldErrorMessage } from "./components/field_error_message";
export { FormActionButtons } from "./components/form_action_buttons";
export { FormFieldWrapper } from "./components/form_field_wrapper";
export { FormHeader } from "./components/form_header";
export { LogoutButton } from "./components/logout_button";
export { PasswordField } from "./components/password_field";
// ProfilePicMenuWrapper - NOT exported (server component - imports .server files)
export { ProfilePicMenu } from "./components/profile_pic_menu";
export { ProfileStamp } from "./components/profile_stamp";
export type { ProfileStampProps, ProfileStampCustomField } from "./components/profile_stamp";
// SidebarLayoutWrapper - NOT exported (test workspace component only)
export { StandaloneLayoutWrapper } from "./components/standalone_layout_wrapper";
export { TwoColumnAuthLayout } from "./components/two_column_auth_layout";
export { UnauthorizedGuard } from "./components/unauthorized_guard";
export { VisualPanel } from "./components/visual_panel";

// section: hook_exports
export { use_auth_status } from "./hooks/use_auth_status";
export { use_hazo_auth, trigger_hazo_auth_refresh } from "./hooks/use_hazo_auth";
export type { UseHazoAuthOptions, UseHazoAuthResult } from "./hooks/use_hazo_auth";

// section: config_exports
export * from "./config/layout_customization";

// section: data_exports
export { createLayoutDataClient } from "./data/layout_data_client";
export type { LayoutDataClient } from "./data/layout_data_client";

// section: utility_exports
export { get_client_ip } from "./utils/ip_address";
export * from "./utils/validation";

