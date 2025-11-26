// file_description: server-only helper to read my settings layout configuration from hazo_auth_config.ini
// section: imports
import { get_config_value } from "hazo_auth/lib/config/config_loader.server";
import { get_user_fields_config } from "hazo_auth/lib/user_fields_config.server";
import { get_password_requirements_config } from "hazo_auth/lib/password_requirements_config.server";
import { get_profile_picture_config } from "hazo_auth/lib/profile_picture_config.server";
import { get_messages_config } from "hazo_auth/lib/messages_config.server";
import { get_ui_sizes_config } from "hazo_auth/lib/ui_sizes_config.server";
import { get_file_types_config } from "hazo_auth/lib/file_types_config.server";
// section: helpers
/**
 * Reads my settings layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns My settings configuration options
 */
export function get_my_settings_config() {
    const section = "hazo_auth__my_settings_layout";
    // Get shared user fields config
    const userFields = get_user_fields_config();
    // Get shared password requirements
    const passwordRequirements = get_password_requirements_config();
    // Get profile picture configuration
    const profilePicture = get_profile_picture_config();
    // Get messages, UI sizes, and file types configuration
    const messages = get_messages_config();
    const uiSizes = get_ui_sizes_config();
    const fileTypes = get_file_types_config();
    // Read optional labels with defaults
    const heading = get_config_value(section, "heading", "Account Settings");
    const subHeading = get_config_value(section, "sub_heading", "Manage your profile, password, and email preferences.");
    const profilePhotoLabel = get_config_value(section, "profile_photo_label", "Profile Photo");
    const profilePhotoRecommendation = get_config_value(section, "profile_photo_recommendation", "Recommended size: 200x200px. JPG, PNG.");
    const uploadPhotoButtonLabel = get_config_value(section, "upload_photo_button_label", "Upload New Photo");
    const removePhotoButtonLabel = get_config_value(section, "remove_photo_button_label", "Remove");
    const profileInformationLabel = get_config_value(section, "profile_information_label", "Profile Information");
    const passwordLabel = get_config_value(section, "password_label", "Password");
    const currentPasswordLabel = get_config_value(section, "current_password_label", "Current Password");
    const newPasswordLabel = get_config_value(section, "new_password_label", "New Password");
    const confirmPasswordLabel = get_config_value(section, "confirm_password_label", "Confirm Password");
    const savePasswordButtonLabel = get_config_value(section, "save_password_button_label", "Save Password");
    const unauthorizedMessage = get_config_value(section, "unauthorized_message", "You must be logged in to access this page.");
    const loginButtonLabel = get_config_value(section, "login_button_label", "Go to login");
    const loginPath = get_config_value(section, "login_path", "/hazo_auth/login");
    return {
        userFields,
        passwordRequirements,
        profilePicture,
        heading,
        subHeading,
        profilePhotoLabel,
        profilePhotoRecommendation,
        uploadPhotoButtonLabel,
        removePhotoButtonLabel,
        profileInformationLabel,
        passwordLabel,
        currentPasswordLabel,
        newPasswordLabel,
        confirmPasswordLabel,
        savePasswordButtonLabel,
        unauthorizedMessage,
        loginButtonLabel,
        loginPath,
        messages,
        uiSizes,
        fileTypes,
    };
}
