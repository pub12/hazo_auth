export type ProfilePictureUploadTabProps = {
    useUpload: boolean;
    onUseUploadChange: (use: boolean) => void;
    onFileSelect: (file: File) => Promise<void>;
    maxSize: number;
    uploadEnabled: boolean;
    disabled?: boolean;
    currentPreview?: string;
    photoUploadDisabledMessage?: string;
    imageCompressionMaxDimension?: number;
    uploadFileHardLimitBytes?: number;
    allowedImageMimeTypes?: string[];
};
/**
 * Upload tab component for profile picture dialog
 * Two columns: left = dropzone, right = preview
 * Uses browser-image-compression for client-side compression
 * @param props - Component props including upload state, file handler, and configuration
 * @returns Upload tab component
 */
export declare function ProfilePictureUploadTab({ useUpload, onUseUploadChange, onFileSelect, maxSize, uploadEnabled, disabled, currentPreview, photoUploadDisabledMessage, imageCompressionMaxDimension, uploadFileHardLimitBytes, // 10MB default
allowedImageMimeTypes, }: ProfilePictureUploadTabProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=profile_picture_upload_tab.d.ts.map