// file_description: provide shared validation utilities for email and password fields across layout components
// section: imports
import type { PasswordRequirementOptions } from "@/components/layouts/shared/config/layout_customization";

// section: constants
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// section: email_validation
/**
 * Validates an email address format
 * @param email - The email address to validate
 * @returns Error message string if invalid, undefined if valid
 */
export function validateEmail(email: string): string | undefined {
  const trimmedEmail = email.trim();
  if (trimmedEmail.length > 0 && !EMAIL_PATTERN.test(trimmedEmail)) {
    return "enter a valid email address";
  }
  return undefined;
}

// section: password_validation
/**
 * Validates a password against specified requirements
 * @param password - The password to validate
 * @param requirements - Password requirement options
 * @returns Array of error message strings if invalid, undefined if valid
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirementOptions,
): string[] | undefined {
  if (password.trim().length === 0) {
    return undefined;
  }

  const messages: string[] = [];

  if (password.length < requirements.minimum_length) {
    messages.push(
      `Password must be at least ${requirements.minimum_length} characters.`,
    );
  }

  if (requirements.require_uppercase && !/[A-Z]/.test(password)) {
    messages.push("Password must include at least one uppercase letter.");
  }

  if (requirements.require_lowercase && !/[a-z]/.test(password)) {
    messages.push("Password must include at least one lowercase letter.");
  }

  if (requirements.require_number && !/\d/.test(password)) {
    messages.push("Password must include at least one number.");
  }

  if (
    requirements.require_special &&
    !/[!@#$%^&*(),.?":{}|<>\-_+=\[\];'/\\]/.test(password)
  ) {
    messages.push("Password must include at least one special character.");
  }

  return messages.length > 0 ? messages : undefined;
}

