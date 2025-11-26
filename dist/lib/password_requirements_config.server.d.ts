export type PasswordRequirementsConfig = {
    minimum_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_number: boolean;
    require_special: boolean;
};
/**
 * Reads shared password requirements configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * This configuration is used by both register and reset password layouts
 * @returns Password requirements configuration options
 */
export declare function get_password_requirements_config(): PasswordRequirementsConfig;
//# sourceMappingURL=password_requirements_config.server.d.ts.map