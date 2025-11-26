export type ProfilePictureGravatarTabProps = {
    email: string;
    useGravatar: boolean;
    onUseGravatarChange: (use: boolean) => void;
    disabled?: boolean;
    gravatarSetupMessage: string;
    gravatarNoAccountMessage: string;
    gravatarSize: number;
};
/**
 * Gravatar tab component for profile picture dialog
 * Shows Gravatar preview and setup instructions
 * @param props - Component props including email, useGravatar state, and change handler
 * @returns Gravatar tab component
 */
export declare function ProfilePictureGravatarTab({ email, useGravatar, onUseGravatarChange, disabled, gravatarSetupMessage, gravatarNoAccountMessage, gravatarSize, }: ProfilePictureGravatarTabProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=profile_picture_gravatar_tab.d.ts.map