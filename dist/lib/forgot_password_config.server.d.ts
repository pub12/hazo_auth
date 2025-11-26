export type ForgotPasswordConfig = {
    alreadyLoggedInMessage: string;
    showLogoutButton: boolean;
    showReturnHomeButton: boolean;
    returnHomeButtonLabel: string;
    returnHomePath: string;
};
/**
 * Reads forgot password layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Forgot password configuration options
 */
export declare function get_forgot_password_config(): ForgotPasswordConfig;
//# sourceMappingURL=forgot_password_config.server.d.ts.map