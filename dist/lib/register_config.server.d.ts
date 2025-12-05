import type { StaticImageData } from "next/image";
export type RegisterConfig = {
    showNameField: boolean;
    passwordRequirements: {
        minimum_length: number;
        require_uppercase: boolean;
        require_lowercase: boolean;
        require_number: boolean;
        require_special: boolean;
    };
    alreadyLoggedInMessage: string;
    showLogoutButton: boolean;
    showReturnHomeButton: boolean;
    returnHomeButtonLabel: string;
    returnHomePath: string;
    signInPath: string;
    signInLabel: string;
    imageSrc: string | StaticImageData;
    imageAlt: string;
    imageBackgroundColor: string;
};
/**
 * Reads register layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Register configuration options
 */
export declare function get_register_config(): RegisterConfig;
//# sourceMappingURL=register_config.server.d.ts.map