export type ProfilePictureDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (profilePictureUrl: string, profileSource: "upload" | "library" | "gravatar") => Promise<void>;
    email: string;
    allowPhotoUpload: boolean;
    maxPhotoSize: number;
    libraryPhotoPath: string;
    currentProfilePictureUrl?: string;
    currentProfileSource?: "upload" | "library" | "gravatar" | "custom";
    saveButtonLabel?: string;
    cancelButtonLabel?: string;
    disabled?: boolean;
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
 * Profile picture dialog component with tabs for Upload, Library, and Gravatar
 * Only one switch can be active at a time
 * @param props - Component props including open state, save handler, and configuration
 * @returns Profile picture dialog component
 */
export declare function ProfilePictureDialog({ open, onOpenChange, onSave, email, allowPhotoUpload, maxPhotoSize, libraryPhotoPath, currentProfilePictureUrl, currentProfileSource, saveButtonLabel, cancelButtonLabel, disabled, messages, uiSizes, fileTypes, }: ProfilePictureDialogProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=profile_picture_dialog.d.ts.map