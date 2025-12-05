import type { StaticImageData } from "next/image";
export type LoginConfig = {
    redirectRoute?: string;
    successMessage: string;
    alreadyLoggedInMessage: string;
    showLogoutButton: boolean;
    showReturnHomeButton: boolean;
    returnHomeButtonLabel: string;
    returnHomePath: string;
    forgotPasswordPath: string;
    forgotPasswordLabel: string;
    createAccountPath: string;
    createAccountLabel: string;
    imageSrc: string | StaticImageData;
    imageAlt: string;
    imageBackgroundColor: string;
};
/**
 * Reads login layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Login configuration options
 */
export declare function get_login_config(): LoginConfig;
//# sourceMappingURL=login_config.server.d.ts.map