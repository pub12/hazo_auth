import { type MySettingsLabelOverrides } from "./config/my_settings_field_config.js";
import type { PasswordRequirementOptions, ButtonPaletteOverrides } from "../shared/config/layout_customization";
export type MySettingsLayoutProps = {
    className?: string;
    labels?: MySettingsLabelOverrides;
    button_colors?: ButtonPaletteOverrides;
    password_requirements: PasswordRequirementOptions;
    profilePicture: {
        allow_photo_upload: boolean;
        upload_photo_path?: string;
        max_photo_size: number;
        user_photo_default: boolean;
        user_photo_default_priority1: "gravatar" | "library";
        user_photo_default_priority2?: "library" | "gravatar";
        library_photo_path: string;
    };
    userFields: {
        show_name_field: boolean;
        show_email_field: boolean;
        show_password_field: boolean;
    };
    unauthorizedMessage?: string;
    loginButtonLabel?: string;
    loginPath?: string;
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
/**
 * My Settings layout component with tabs for profile and security settings
 * Shows editable fields for name, email, and password change dialog
 * Displays profile picture and last logged in information
 * @param props - Component props including labels, button colors, password requirements, etc.
 * @returns My settings layout component
 */
export default function my_settings_layout({ className, labels, button_colors, password_requirements, profilePicture, userFields, unauthorizedMessage, loginButtonLabel, loginPath, heading, subHeading, profilePhotoLabel, profilePhotoRecommendation, uploadPhotoButtonLabel, removePhotoButtonLabel, profileInformationLabel, passwordLabel, currentPasswordLabel, newPasswordLabel, confirmPasswordLabel, messages, uiSizes, fileTypes, }: MySettingsLayoutProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map