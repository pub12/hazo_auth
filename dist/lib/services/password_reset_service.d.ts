import type { HazoConnectAdapter } from "hazo_connect";
export type PasswordResetRequestData = {
    email: string;
};
export type PasswordResetRequestResult = {
    success: boolean;
    error?: string;
    /** True if the user doesn't have a password set (Google-only user) */
    no_password_set?: boolean;
};
export type PasswordResetData = {
    token: string;
    new_password: string;
    minimum_length?: number;
};
export type PasswordResetResult = {
    success: boolean;
    user_id?: string;
    email?: string;
    error?: string;
};
export type PasswordResetTokenValidationData = {
    token: string;
};
export type PasswordResetTokenValidationResult = {
    success: boolean;
    error?: string;
};
/**
 * Requests a password reset for a user by email
 * Generates a secure token, hashes it, and stores it in hazo_refresh_tokens with token_type = 'password_reset'
 * Invalidates any existing password reset tokens for the user before creating a new one
 * @param adapter - The hazo_connect adapter instance
 * @param data - Password reset request data (email)
 * @returns Password reset request result with success status or error
 */
export declare function request_password_reset(adapter: HazoConnectAdapter, data: PasswordResetRequestData): Promise<PasswordResetRequestResult>;
/**
 * Validates a password reset token without resetting the password
 * Verifies the token exists and checks if it has expired
 * @param adapter - The hazo_connect adapter instance
 * @param data - Token validation data (token)
 * @returns Token validation result with success status or error
 */
export declare function validate_password_reset_token(adapter: HazoConnectAdapter, data: PasswordResetTokenValidationData): Promise<PasswordResetTokenValidationResult>;
/**
 * Resets a user's password using a password reset token
 * Verifies the token, checks expiration, updates password, and deletes the token
 * @param adapter - The hazo_connect adapter instance
 * @param data - Password reset data (token, new_password)
 * @returns Password reset result with success status, user_id, email, or error
 */
export declare function reset_password(adapter: HazoConnectAdapter, data: PasswordResetData): Promise<PasswordResetResult>;
//# sourceMappingURL=password_reset_service.d.ts.map