import type { ProfilePicMenuMenuItem } from "../../../../lib/profile_pic_menu_config.server";
export type ProfilePicMenuProps = {
    show_single_button?: boolean;
    sign_up_label?: string;
    sign_in_label?: string;
    register_path?: string;
    login_path?: string;
    settings_path?: string;
    logout_path?: string;
    custom_menu_items?: ProfilePicMenuMenuItem[];
    className?: string;
    avatar_size?: "default" | "sm" | "lg";
    variant?: "dropdown" | "sidebar";
    sidebar_group_label?: string;
};
/**
 * Profile picture menu component
 * Shows user profile picture when authenticated, or sign up/sign in buttons when not authenticated
 * Supports two variants:
 * - "dropdown" (default): Clicking profile picture opens dropdown menu (for navbar/header)
 * - "sidebar": Shows profile picture and name in sidebar, clicking opens dropdown menu (for sidebar navigation)
 * @param props - Component props including configuration options
 * @returns Profile picture menu component
 */
export declare function ProfilePicMenu({ show_single_button, sign_up_label, sign_in_label, register_path, login_path, settings_path, logout_path, custom_menu_items, className, avatar_size, variant, sidebar_group_label, }: ProfilePicMenuProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=profile_pic_menu.d.ts.map