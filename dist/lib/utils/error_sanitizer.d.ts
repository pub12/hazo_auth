import { create_app_logger } from "../app_logger.js";
export type ErrorSanitizationOptions = {
    logToConsole?: boolean;
    logToLogger?: boolean;
    logger?: ReturnType<typeof create_app_logger>;
    context?: Record<string, unknown>;
};
/**
 * Sanitizes error messages for user display
 * Replaces technical error messages with user-friendly ones
 * @param error - The error object or message
 * @param options - Options for logging and context
 * @returns User-friendly error message
 */
export declare function sanitize_error_for_user(error: unknown, options?: ErrorSanitizationOptions): string;
//# sourceMappingURL=error_sanitizer.d.ts.map