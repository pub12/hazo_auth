export type ProfilePicMenuWrapperProps = {
    className?: string;
    avatar_size?: "default" | "sm" | "lg";
    variant?: "dropdown" | "sidebar";
    sidebar_group_label?: string;
};
/**
 * Server wrapper component that loads profile picture menu configuration from hazo_auth_config.ini
 * and passes it to the client ProfilePicMenu component
 * @param props - Component props including className, avatar_size, variant, and sidebar_group_label
 * @returns ProfilePicMenu component with loaded configuration
 */
export declare function ProfilePicMenuWrapper({ className, avatar_size, variant, sidebar_group_label, }: ProfilePicMenuWrapperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=profile_pic_menu_wrapper.d.ts.map