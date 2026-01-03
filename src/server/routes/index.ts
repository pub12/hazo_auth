// file_description: barrel export for all route handlers
// These exports allow consuming projects to create thin API route wrappers

// Authentication routes
export { POST as loginPOST } from "./login.js";
export { POST as registerPOST } from "./register.js";
export { POST as logoutPOST } from "./logout.js";
export { GET as meGET } from "./me.js";

// Password management routes
export { POST as forgotPasswordPOST } from "./forgot_password.js";
export { POST as resetPasswordPOST } from "./reset_password.js";
export { POST as changePasswordPOST } from "./change_password.js";
export { GET as validateResetTokenGET } from "./validate_reset_token.js";

// Email verification routes
export { GET as verifyEmailGET } from "./verify_email.js";
export { POST as resendVerificationPOST } from "./resend_verification.js";

// User profile routes
export { PATCH as updateUserPATCH } from "./update_user.js";
export { POST as uploadProfilePicturePOST } from "./upload_profile_picture.js";
export { DELETE as removeProfilePictureDELETE } from "./remove_profile_picture.js";
export { GET as libraryPhotosGET } from "./library_photos.js";
export { GET as libraryPhotoGET } from "./library_photo.js";
export { GET as profilePictureFilenameGET } from "./profile_picture_filename.js";

// Auth utility routes
export { POST as getAuthPOST } from "./get_auth.js";
export { POST as invalidateCachePOST } from "./invalidate_cache.js";

// User management routes
export { GET as userManagementUsersGET, PATCH as userManagementUsersPATCH, POST as userManagementUsersPOST } from "./user_management_users.js";
export { GET as userManagementPermissionsGET, POST as userManagementPermissionsPOST, PUT as userManagementPermissionsPUT, DELETE as userManagementPermissionsDELETE } from "./user_management_permissions.js";
export { GET as userManagementRolesGET, POST as userManagementRolesPOST, PUT as userManagementRolesPUT } from "./user_management_roles.js";
export { GET as userManagementUsersRolesGET, POST as userManagementUsersRolesPOST, PUT as userManagementUsersRolesPUT } from "./user_management_users_roles.js";

// App user data routes (custom application-specific user data)
export { GET as appUserDataGET, PATCH as appUserDataPATCH, PUT as appUserDataPUT, DELETE as appUserDataDELETE } from "./app_user_data.js";
export { GET as appUserDataSchemaGET } from "./app_user_data_schema.js";

// Invitation routes (for inviting users to scopes)
export { GET as invitationsGET, POST as invitationsPOST, PATCH as invitationsPATCH, DELETE as invitationsDELETE } from "./invitations.js";

// Create firm routes (for new users creating their firm)
export { POST as createFirmPOST } from "./create_firm.js";
