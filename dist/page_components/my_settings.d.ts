import type { PasswordRequirementOptions } from "../components/layouts/shared/config/layout_customization";
declare const DEFAULT_MESSAGES: {
    photo_upload_disabled_message: string;
    gravatar_setup_message: string;
    gravatar_no_account_message: string;
    library_tooltip_message: string;
};
declare const DEFAULT_UI_SIZES: {
    gravatar_size: number;
    profile_picture_size: number;
    tooltip_icon_size_default: number;
    tooltip_icon_size_small: number;
    library_photo_grid_columns: number;
    library_photo_preview_size: number;
    image_compression_max_dimension: number;
    upload_file_hard_limit_bytes: number;
};
export type MySettingsPageProps = {
    userFields?: {
        show_name_field?: boolean;
        show_email_field?: boolean;
        show_password_field?: boolean;
    };
    passwordRequirements?: Partial<PasswordRequirementOptions>;
    profilePicture?: {
        allow_photo_upload?: boolean;
        upload_photo_path?: string;
        max_photo_size?: number;
        user_photo_default?: boolean;
        user_photo_default_priority1?: "gravatar" | "library";
        user_photo_default_priority2?: "library" | "gravatar";
        library_photo_path?: string;
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
    messages?: Partial<typeof DEFAULT_MESSAGES>;
    uiSizes?: Partial<typeof DEFAULT_UI_SIZES>;
    fileTypes?: {
        allowed_image_extensions?: string[];
        allowed_image_mime_types?: string[];
    };
};
/**
 * Zero-config my settings page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns My settings page component
 */
export declare function MySettingsPage({ userFields, passwordRequirements, profilePicture, heading, subHeading, profilePhotoLabel, profilePhotoRecommendation, uploadPhotoButtonLabel, removePhotoButtonLabel, profileInformationLabel, passwordLabel, currentPasswordLabel, newPasswordLabel, confirmPasswordLabel, savePasswordButtonLabel, unauthorizedMessage, loginButtonLabel, loginPath, messages, uiSizes, fileTypes, }?: MySettingsPageProps): import("react/jsx-runtime").JSX.Element;
export default MySettingsPage;
//# sourceMappingURL=my_settings.d.ts.map