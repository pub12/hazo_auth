import type { PasswordRequirementOptions } from "hazo_auth/components/layouts/shared/config/layout_customization";
/**
 * Validates an email address format
 * @param email - The email address to validate
 * @returns Error message string if invalid, undefined if valid
 */
export declare function validateEmail(email: string): string | undefined;
/**
 * Validates a password against specified requirements
 * @param password - The password to validate
 * @param requirements - Password requirement options
 * @returns Array of error message strings if invalid, undefined if valid
 */
export declare function validatePassword(password: string, requirements: PasswordRequirementOptions): string[] | undefined;
//# sourceMappingURL=validation.d.ts.map