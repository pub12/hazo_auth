import "server-only";
export type NavbarConfig = {
    /** Enable navbar on auth pages */
    enable_navbar: boolean;
    /** Logo image path */
    logo_path: string;
    /** Logo width in pixels */
    logo_width: number;
    /** Logo height in pixels */
    logo_height: number;
    /** Company/application name displayed next to logo */
    company_name: string;
    /** Home link path */
    home_path: string;
    /** Home link label */
    home_label: string;
    /** Show home link */
    show_home_link: boolean;
    /** Navbar background color (empty = inherit) */
    background_color: string;
    /** Navbar text color (empty = inherit) */
    text_color: string;
    /** Navbar height in pixels */
    height: number;
};
/**
 * Reads navbar configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Navbar configuration options
 */
export declare function get_navbar_config(): NavbarConfig;
/**
 * Helper to check if navbar is enabled in config
 * @returns true if navbar is enabled
 */
export declare function is_navbar_enabled(): boolean;
//# sourceMappingURL=navbar_config.server.d.ts.map