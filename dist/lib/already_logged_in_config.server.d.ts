export type AlreadyLoggedInConfig = {
    message: string;
    showLogoutButton: boolean;
    showReturnHomeButton: boolean;
    returnHomeButtonLabel: string;
    returnHomePath: string;
};
/**
 * Reads already logged in configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Already logged in configuration options
 */
export declare function get_already_logged_in_config(): AlreadyLoggedInConfig;
//# sourceMappingURL=already_logged_in_config.server.d.ts.map