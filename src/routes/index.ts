// file_description: barrel export for all re-exportable route handlers and page components
// section: page_exports
// These are the client-side page components that can be re-exported by consumers
export { LoginPageClient } from "hazo_auth/app/hazo_auth/login/login_page_client";
export { RegisterPageClient } from "hazo_auth/app/hazo_auth/register/register_page_client";
export { ForgotPasswordPageClient } from "hazo_auth/app/hazo_auth/forgot_password/forgot_password_page_client";
export { ResetPasswordPageClient } from "hazo_auth/app/hazo_auth/reset_password/reset_password_page_client";
export { VerifyEmailPageClient } from "hazo_auth/app/hazo_auth/verify_email/verify_email_page_client";
export { MySettingsPageClient } from "hazo_auth/app/hazo_auth/my_settings/my_settings_page_client";
export { UserManagementPageClient } from "hazo_auth/app/hazo_auth/user_management/user_management_page_client";

// section: api_handler_exports
// These are the API route handlers that can be re-exported by consumers
export { POST as loginPOST } from "hazo_auth/app/api/hazo_auth/login/route";
export { POST as registerPOST } from "hazo_auth/app/api/hazo_auth/register/route";
export { POST as forgotPasswordPOST } from "hazo_auth/app/api/hazo_auth/forgot_password/route";
export { POST as resetPasswordPOST } from "hazo_auth/app/api/hazo_auth/reset_password/route";
export { POST as verifyEmailPOST } from "hazo_auth/app/api/hazo_auth/verify_email/route";
export { POST as resendVerificationPOST } from "hazo_auth/app/api/hazo_auth/resend_verification/route";
export { POST as logoutPOST } from "hazo_auth/app/api/hazo_auth/logout/route";
export { POST as getAuthPOST } from "hazo_auth/app/api/hazo_auth/get_auth/route";
export { GET as mePOST } from "hazo_auth/app/api/hazo_auth/me/route";
export { POST as changePasswordPOST } from "hazo_auth/app/api/hazo_auth/change_password/route";
export { POST as updateUserPOST } from "hazo_auth/app/api/hazo_auth/update_user/route";
export { POST as invalidateCachePOST } from "hazo_auth/app/api/hazo_auth/invalidate_cache/route";
export { GET as libraryPhotosGET } from "hazo_auth/app/api/hazo_auth/library_photos/route";
export { POST as uploadProfilePicturePOST } from "hazo_auth/app/api/hazo_auth/upload_profile_picture/route";
export { POST as removeProfilePicturePOST } from "hazo_auth/app/api/hazo_auth/remove_profile_picture/route";
export { GET as validateResetTokenGET } from "hazo_auth/app/api/hazo_auth/validate_reset_token/route";

// section: shell_exports
// Shell component for wrapping pages
export { AuthPageShell } from "hazo_auth/components/layouts/shared/components/auth_page_shell";

