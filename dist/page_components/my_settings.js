// file_description: zero-config my settings page component for hazo_auth
// Consumers can use this directly without needing to configure props
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// section: imports
import my_settings_layout from "../components/layouts/my_settings.js";
// section: default_configuration
const DEFAULT_USER_FIELDS = {
    show_name_field: true,
    show_email_field: true,
    show_password_field: true,
};
const DEFAULT_PASSWORD_REQUIREMENTS = {
    minimum_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_number: true,
    require_special: false,
};
const DEFAULT_PROFILE_PICTURE = {
    allow_photo_upload: true,
    upload_photo_path: "/api/hazo_auth/upload_profile_picture",
    max_photo_size: 5242880, // 5MB
    user_photo_default: true,
    user_photo_default_priority1: "gravatar",
    user_photo_default_priority2: "library",
    library_photo_path: "/profile_pictures/library",
};
const DEFAULT_MESSAGES = {
    photo_upload_disabled_message: "Photo upload is currently disabled. Contact your administrator.",
    gravatar_setup_message: "To use Gravatar, create a free account at gravatar.com with the same email address you use here.",
    gravatar_no_account_message: "No Gravatar account found for your email. Using library photo instead.",
    library_tooltip_message: "Choose from our library of profile pictures",
};
const DEFAULT_UI_SIZES = {
    gravatar_size: 200,
    profile_picture_size: 128,
    tooltip_icon_size_default: 16,
    tooltip_icon_size_small: 14,
    library_photo_grid_columns: 4,
    library_photo_preview_size: 80,
    image_compression_max_dimension: 800,
    upload_file_hard_limit_bytes: 10485760, // 10MB
};
const DEFAULT_FILE_TYPES = {
    allowed_image_extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    allowed_image_mime_types: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};
// section: component
/**
 * Zero-config my settings page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns My settings page component
 */
export function MySettingsPage({ userFields, passwordRequirements, profilePicture, heading = "Account Settings", subHeading = "Manage your profile, password, and email preferences.", profilePhotoLabel = "Profile Photo", profilePhotoRecommendation = "Recommended: Square image, at least 200x200 pixels", uploadPhotoButtonLabel = "Upload Photo", removePhotoButtonLabel = "Remove", profileInformationLabel = "Profile Information", passwordLabel = "Password", currentPasswordLabel = "Current Password", newPasswordLabel = "New Password", confirmPasswordLabel = "Confirm Password", savePasswordButtonLabel = "Update Password", unauthorizedMessage = "You must be logged in to access this page.", loginButtonLabel = "Go to login", loginPath = "/hazo_auth/login", messages, uiSizes, fileTypes, } = {}) {
    // Merge provided props with defaults
    const mergedUserFields = Object.assign(Object.assign({}, DEFAULT_USER_FIELDS), userFields);
    const mergedPasswordRequirements = Object.assign(Object.assign({}, DEFAULT_PASSWORD_REQUIREMENTS), passwordRequirements);
    const mergedProfilePicture = Object.assign(Object.assign({}, DEFAULT_PROFILE_PICTURE), profilePicture);
    const mergedMessages = Object.assign(Object.assign({}, DEFAULT_MESSAGES), messages);
    const mergedUiSizes = Object.assign(Object.assign({}, DEFAULT_UI_SIZES), uiSizes);
    const mergedFileTypes = Object.assign(Object.assign({}, DEFAULT_FILE_TYPES), fileTypes);
    const MySettingsLayout = my_settings_layout;
    return (_jsx(MySettingsLayout, { userFields: mergedUserFields, password_requirements: mergedPasswordRequirements, profilePicture: mergedProfilePicture, heading: heading, subHeading: subHeading, profilePhotoLabel: profilePhotoLabel, profilePhotoRecommendation: profilePhotoRecommendation, uploadPhotoButtonLabel: uploadPhotoButtonLabel, removePhotoButtonLabel: removePhotoButtonLabel, profileInformationLabel: profileInformationLabel, passwordLabel: passwordLabel, currentPasswordLabel: currentPasswordLabel, newPasswordLabel: newPasswordLabel, confirmPasswordLabel: confirmPasswordLabel, unauthorizedMessage: unauthorizedMessage, loginButtonLabel: loginButtonLabel, loginPath: loginPath, messages: mergedMessages, uiSizes: mergedUiSizes, fileTypes: mergedFileTypes }));
}
export default MySettingsPage;
