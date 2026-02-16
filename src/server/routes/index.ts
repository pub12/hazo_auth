// file_description: barrel export for all route handlers
// These exports allow consuming projects to create thin API route wrappers

// Authentication routes
export { POST as loginPOST } from "./login";
export { POST as registerPOST } from "./register";
export { POST as logoutPOST } from "./logout";
export { GET as meGET } from "./me";

// Password management routes
export { POST as forgotPasswordPOST } from "./forgot_password";
export { POST as resetPasswordPOST } from "./reset_password";
export { POST as changePasswordPOST } from "./change_password";
export { GET as validateResetTokenGET } from "./validate_reset_token";

// Email verification routes
export { GET as verifyEmailGET } from "./verify_email";
export { POST as resendVerificationPOST } from "./resend_verification";

// User profile routes
export { PATCH as updateUserPATCH } from "./update_user";
export { POST as uploadProfilePicturePOST } from "./upload_profile_picture";
export { DELETE as removeProfilePictureDELETE } from "./remove_profile_picture";
export { GET as libraryPhotosGET } from "./library_photos";
export { GET as libraryPhotoGET } from "./library_photo";
export { GET as profilePictureFilenameGET } from "./profile_picture_filename";

// Auth utility routes
export { POST as getAuthPOST } from "./get_auth";
export { POST as invalidateCachePOST } from "./invalidate_cache";

// User management routes
export { GET as userManagementUsersGET, PATCH as userManagementUsersPATCH, POST as userManagementUsersPOST } from "./user_management_users";
export { GET as userManagementPermissionsGET, POST as userManagementPermissionsPOST, PUT as userManagementPermissionsPUT, DELETE as userManagementPermissionsDELETE } from "./user_management_permissions";
export { GET as userManagementRolesGET, POST as userManagementRolesPOST, PUT as userManagementRolesPUT } from "./user_management_roles";
export { GET as userManagementUsersRolesGET, POST as userManagementUsersRolesPOST, PUT as userManagementUsersRolesPUT } from "./user_management_users_roles";

// App user data routes (custom application-specific user data)
export { GET as appUserDataGET, PATCH as appUserDataPATCH, PUT as appUserDataPUT, DELETE as appUserDataDELETE } from "./app_user_data";
export { GET as appUserDataSchemaGET } from "./app_user_data_schema";

// Invitation routes (for inviting users to scopes)
export { GET as invitationsGET, POST as invitationsPOST, PATCH as invitationsPATCH, DELETE as invitationsDELETE } from "./invitations";

// Create firm routes (for new users creating their firm)
export { POST as createFirmPOST } from "./create_firm";

// OAuth routes
export { GET as nextauthGET, POST as nextauthPOST } from "./nextauth";
export { GET as oauthGoogleCallbackGET } from "./oauth_google_callback";
export { POST as setPasswordPOST } from "./set_password";
