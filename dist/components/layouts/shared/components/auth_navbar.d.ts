export type AuthNavbarProps = {
    /** Logo image path (empty string = no logo shown) */
    logo_path?: string;
    /** Logo width in pixels */
    logo_width?: number;
    /** Logo height in pixels */
    logo_height?: number;
    /** Company/application name displayed next to logo */
    company_name?: string;
    /** Home link path */
    home_path?: string;
    /** Home link label */
    home_label?: string;
    /** Show home link */
    show_home_link?: boolean;
    /** Navbar background color */
    background_color?: string;
    /** Navbar text color */
    text_color?: string;
    /** Navbar height in pixels */
    height?: number;
    /** Additional CSS class */
    className?: string;
};
export declare function AuthNavbar({ logo_path, logo_width, logo_height, company_name, home_path, home_label, show_home_link, background_color, text_color, height, className, }: AuthNavbarProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=auth_navbar.d.ts.map