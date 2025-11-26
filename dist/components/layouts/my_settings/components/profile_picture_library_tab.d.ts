export type ProfilePictureLibraryTabProps = {
    useLibrary: boolean;
    onUseLibraryChange: (use: boolean) => void;
    onPhotoSelect: (photoUrl: string) => void;
    disabled?: boolean;
    libraryPhotoPath: string;
    currentPhotoUrl?: string;
    libraryTooltipMessage: string;
    tooltipIconSizeSmall: number;
    libraryPhotoGridColumns: number;
    libraryPhotoPreviewSize: number;
};
/**
 * Library tab component for profile picture dialog
 * Two columns: left = vertical category tabs, right = image grid + preview
 * Lazy loads thumbnails when category is selected
 * @param props - Component props including library state, photo selection handler, and configuration
 * @returns Library tab component
 */
export declare function ProfilePictureLibraryTab({ useLibrary, onUseLibraryChange, onPhotoSelect, disabled, libraryPhotoPath, currentPhotoUrl, libraryTooltipMessage, tooltipIconSizeSmall, libraryPhotoGridColumns, libraryPhotoPreviewSize, }: ProfilePictureLibraryTabProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=profile_picture_library_tab.d.ts.map