// file_description: server-only helper to read my settings layout configuration from hazo_auth_config.ini
// section: imports
import { get_config_value } from "./config/config_loader.server";
import { get_user_fields_config } from "./user_fields_config.server";
import { get_password_requirements_config } from "./password_requirements_config.server";
import { get_profile_picture_config } from "./profile_picture_config.server";
import { get_messages_config } from "./messages_config.server";
import { get_ui_sizes_config } from "./ui_sizes_config.server";
import { get_file_types_config } from "./file_types_config.server";

// section: types
export type MySettingsConfig = {
  userFields: {
    show_name_field: boolean;
    show_email_field: boolean;
    show_password_field: boolean;
  };
  passwordRequirements: {
    minimum_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_number: boolean;
    require_special: boolean;
  };
  profilePicture: {
    allow_photo_upload: boolean;
    upload_photo_path?: string;
    max_photo_size: number;
    user_photo_default: boolean;
    user_photo_default_priority1: "gravatar" | "library";
    user_photo_default_priority2?: "library" | "gravatar";
    library_photo_path: string;
  };
  heading?: string;
  subHeading?: string;
  profilePhotoLabel?: string;
  profilePhotoRecommendation?: string;
  uploadPhotoButtonLabel?: string;
  removePhotoButtonLabel?: string;
  profileInformationLabel?: string;
  passwordLabel?: string;
  currentPasswordLabel?: string;
  newPasswordLabel?: string;
  confirmPasswordLabel?: string;
  savePasswordButtonLabel?: string;
  unauthorizedMessage?: string;
  loginButtonLabel?: string;
  loginPath?: string;
  messages: {
    photo_upload_disabled_message: string;
    gravatar_setup_message: string;
    gravatar_no_account_message: string;
    library_tooltip_message: string;
  };
  uiSizes: {
    gravatar_size: number;
    profile_picture_size: number;
    tooltip_icon_size_default: number;
    tooltip_icon_size_small: number;
    library_photo_grid_columns: number;
    library_photo_preview_size: number;
    image_compression_max_dimension: number;
    upload_file_hard_limit_bytes: number;
  };
  fileTypes: {
    allowed_image_extensions: string[];
    allowed_image_mime_types: string[];
  };
};

// section: helpers
/**
 * Reads my settings layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns My settings configuration options
 */
export function get_my_settings_config(): MySettingsConfig {
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

