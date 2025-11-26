export type ProfilePictureDisplayProps = {
    profilePictureUrl?: string;
    name?: string;
    email?: string;
    onEdit?: () => void;
    disabled?: boolean;
};
/**
 * Profile picture display component
 * Shows profile picture with fallback to initials or default icon
 * Displays pencil icon for editing (functionality to be implemented later)
 * @param props - Component props including profile picture URL, name, email, onEdit callback
 * @returns Profile picture display component
 */
export declare function ProfilePictureDisplay({ profilePictureUrl, name, email, onEdit, disabled, }: ProfilePictureDisplayProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=profile_picture_display.d.ts.map