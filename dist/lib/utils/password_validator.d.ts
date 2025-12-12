import type { PasswordRequirementOptions } from "../../components/layouts/shared/config/layout_customization";
export type PasswordValidationResult = {
    valid: boolean;
    errors: string[];
};
/**
 * Validates a password against specified requirements (server-side version)
 * @param password - The password to validate
 * @param requirements - Password requirement options
 * @returns Validation result with valid flag and error messages
 */
export declare function validate_password(password: string, requirements: PasswordRequirementOptions): PasswordValidationResult;
//# sourceMappingURL=password_validator.d.ts.map