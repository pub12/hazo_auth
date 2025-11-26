export type EmailVerificationConfig = {
    alreadyLoggedInMessage: string;
    showLogoutButton: boolean;
    showReturnHomeButton: boolean;
    returnHomeButtonLabel: string;
    returnHomePath: string;
};
/**
 * Reads email verification layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Email verification configuration options
 */
export declare function get_email_verification_config(): EmailVerificationConfig;
//# sourceMappingURL=email_verification_config.server.d.ts.map