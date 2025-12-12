export type OAuthConfig = {
    /** Enable Google OAuth login */
    enable_google: boolean;
    /** Enable traditional email/password login */
    enable_email_password: boolean;
    /** Auto-link Google login to existing unverified email/password accounts */
    auto_link_unverified_accounts: boolean;
    /** Text displayed on the Google sign-in button */
    google_button_text: string;
    /** Text displayed on the divider between OAuth and email/password form */
    oauth_divider_text: string;
};
/**
 * Reads OAuth configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns OAuth configuration options
 */
export declare function get_oauth_config(): OAuthConfig;
/**
 * Helper to check if Google OAuth is enabled
 * @returns true if Google OAuth is enabled in config
 */
export declare function is_google_oauth_enabled(): boolean;
/**
 * Helper to check if email/password login is enabled
 * @returns true if email/password login is enabled in config
 */
export declare function is_email_password_enabled(): boolean;
//# sourceMappingURL=oauth_config.server.d.ts.map