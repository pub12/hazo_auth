export type MenuItemType = "info" | "link" | "separator";
export type ProfilePicMenuMenuItem = {
    type: MenuItemType;
    label?: string;
    value?: string;
    href?: string;
    order: number;
    id: string;
};
export type ProfilePicMenuConfig = {
    show_single_button: boolean;
    sign_up_label: string;
    sign_in_label: string;
    register_path: string;
    login_path: string;
    settings_path: string;
    logout_path: string;
    custom_menu_items: ProfilePicMenuMenuItem[];
};
/**
 * Reads profile picture menu configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Profile picture menu configuration options
 */
export declare function get_profile_pic_menu_config(): ProfilePicMenuConfig;
//# sourceMappingURL=profile_pic_menu_config.server.d.ts.map