// file_description: utility functions for sanitizing error messages for user display
// section: imports
import { create_app_logger } from "hazo_auth/lib/app_logger";

// section: constants
const USER_FRIENDLY_ERROR_MESSAGE = "We are facing some issues in our system, please try again later.";

// section: types
export type ErrorSanitizationOptions = {
  logToConsole?: boolean;
  logToLogger?: boolean;
  logger?: ReturnType<typeof create_app_logger>;
  context?: Record<string, unknown>;
};

// section: helpers
/**
 * Sanitizes error messages for user display
 * Replaces technical error messages with user-friendly ones
 * @param error - The error object or message
 * @param options - Options for logging and context
 * @returns User-friendly error message
 */
export function sanitize_error_for_user(
  error: unknown,
  options: ErrorSanitizationOptions = {}
): string {
  const { logToConsole = true, logToLogger = true, logger, context = {} } = options;

  // Extract detailed error message
  const detailed_error_message =
    error instanceof Error ? error.message : String(error);
  const error_stack = error instanceof Error ? error.stack : undefined;

  // Log detailed error to console
  if (logToConsole) {
    console.error("Detailed error:", {
      message: detailed_error_message,
      stack: error_stack,
      ...context,
    });
  }

  // Log detailed error to logger if provided
  if (logToLogger && logger) {
    logger.error("error_occurred", {
      filename: context.filename as string || "unknown",
      line_number: context.line_number as number || 0,
      error_message: detailed_error_message,
      error_stack,
      ...context,
    });
  }

  // Check if error is a PostgREST or database-related error
  const is_database_error =
    detailed_error_message.includes("PostgREST") ||
    detailed_error_message.includes("403 Forbidden") ||
    detailed_error_message.includes("404 Not Found") ||
    detailed_error_message.includes("500 Internal Server Error") ||
    detailed_error_message.includes("database") ||
    detailed_error_message.includes("connection") ||
    detailed_error_message.includes("timeout");

  // Return user-friendly message for database/API errors
  if (is_database_error) {
    return USER_FRIENDLY_ERROR_MESSAGE;
  }

  // For other errors, return the original message (could be user-friendly already)
  // But still log the detailed error
  return detailed_error_message;
}


