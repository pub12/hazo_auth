import type { StaticImageData } from "next/image";
export type ResetPasswordConfig = {
    errorMessage: string;
    successMessage: string;
    loginPath: string;
    forgotPasswordPath: string;
    alreadyLoggedInMessage: string;
    showLogoutButton: boolean;
    showReturnHomeButton: boolean;
    returnHomeButtonLabel: string;
    returnHomePath: string;
    passwordRequirements: {
        minimum_length: number;
        require_uppercase: boolean;
        require_lowercase: boolean;
        require_number: boolean;
        require_special: boolean;
    };
    imageSrc: string | StaticImageData;
    imageAlt: string;
    imageBackgroundColor: string;
};
/**
 * Reads reset password layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Reset password configuration options
 */
export declare function get_reset_password_config(): ResetPasswordConfig;
//# sourceMappingURL=reset_password_config.server.d.ts.map