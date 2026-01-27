// file_description: server-only entry point for hazo_auth package
// This file exports server-side modules that require Node.js APIs
// IMPORTANT: Only import this in server contexts (API routes, Server Components)
//
// USAGE:
// import { hazo_get_auth, get_login_config } from "hazo_auth/server-lib";
//
// For client-side code (Client Components), use:
// import { ProfilePicMenu, use_auth_status, cn } from "hazo_auth/client";
// Or: import { cn } from "hazo_auth";
// section: server_only_guard
import "server-only";
// section: auth_exports
export * from "./lib/auth/index.js";
// section: service_exports
export * from "./lib/services/index.js";
// section: config_exports
export { get_config_value, get_config_number, get_config_boolean, get_config_array, read_config_section, } from "./lib/config/config_loader.server.js";
// section: config_server_exports
export { get_login_config } from "./lib/login_config.server.js";
export { get_register_config } from "./lib/register_config.server.js";
export { get_forgot_password_config } from "./lib/forgot_password_config.server.js";
export { get_reset_password_config } from "./lib/reset_password_config.server.js";
export { get_email_verification_config } from "./lib/email_verification_config.server.js";
export { get_my_settings_config } from "./lib/my_settings_config.server.js";
export { get_user_management_config } from "./lib/user_management_config.server.js";
export { get_profile_picture_config } from "./lib/profile_picture_config.server.js";
export { get_profile_pic_menu_config } from "./lib/profile_pic_menu_config.server.js";
export { get_already_logged_in_config } from "./lib/already_logged_in_config.server.js";
export { get_ui_shell_config } from "./lib/ui_shell_config.server.js";
export { get_ui_sizes_config } from "./lib/ui_sizes_config.server.js";
export { get_auth_utility_config } from "./lib/auth_utility_config.server.js";
export { get_password_requirements_config } from "./lib/password_requirements_config.server.js";
export { get_messages_config } from "./lib/messages_config.server.js";
export { get_user_fields_config } from "./lib/user_fields_config.server.js";
export { get_file_types_config } from "./lib/file_types_config.server.js";
export { get_oauth_config, is_google_oauth_enabled, is_email_password_enabled, } from "./lib/oauth_config.server.js";
export { get_branding_config, is_branding_enabled, is_allowed_logo_format, get_max_logo_size_bytes, } from "./lib/branding_config.server.js";
// section: hazo_connect_exports
export { create_sqlite_hazo_connect } from "./lib/hazo_connect_setup.js";
export { get_hazo_connect_instance } from "./lib/hazo_connect_instance.server.js";
// section: logger_exports
export { create_app_logger } from "./lib/app_logger.js";
// section: util_exports
export { sanitize_error_for_user } from "./lib/utils/error_sanitizer.js";
export * from "./lib/utils/api_route_helpers.js";
