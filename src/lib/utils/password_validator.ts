// file_description: server-side password validation utility
// section: imports
import type { PasswordRequirementOptions } from "../../components/layouts/shared/config/layout_customization";

// section: types
export type PasswordValidationResult = {
  valid: boolean;
  errors: string[];
};

// section: helpers
/**
 * Validates a password against specified requirements (server-side version)
 * @param password - The password to validate
 * @param requirements - Password requirement options
 * @returns Validation result with valid flag and error messages
 */
export function validate_password(
  password: string,
  requirements: PasswordRequirementOptions
): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.trim().length === 0) {
    return {
      valid: false,
      errors: ["Password is required"],
    };
  }

  if (password.length < requirements.minimum_length) {
    errors.push(
      `Password must be at least ${requirements.minimum_length} characters`
    );
  }

  if (requirements.require_uppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter");
  }

  if (requirements.require_lowercase && !/[a-z]/.test(password)) {
    errors.push("Password must include at least one lowercase letter");
  }

  if (requirements.require_number && !/\d/.test(password)) {
    errors.push("Password must include at least one number");
  }

  if (
    requirements.require_special &&
    !/[!@#$%^&*(),.?":{}|<>\-_+=\[\];'/\\]/.test(password)
  ) {
    errors.push("Password must include at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
