import type { HazoConnectAdapter } from "hazo_connect";
export type EmailVerificationTokenData = {
    token: string;
};
export type EmailVerificationResult = {
    success: boolean;
    user_id?: string;
    email?: string;
    error?: string;
};
export type ResendVerificationData = {
    email: string;
};
export type ResendVerificationResult = {
    success: boolean;
    error?: string;
};
/**
 * Verifies an email verification token
 * Updates email_verified to true in hazo_users and deletes the token
 * @param adapter - The hazo_connect adapter instance
 * @param data - Email verification token data (token)
 * @returns Email verification result with success status, user_id, email, or error
 */
export declare function verify_email_token(adapter: HazoConnectAdapter, data: EmailVerificationTokenData): Promise<EmailVerificationResult>;
/**
 * Resends an email verification token for a user
 * Creates a new email verification token and stores it in hazo_refresh_tokens
 * Invalidates any existing email verification tokens for the user before creating a new one
 * @param adapter - The hazo_connect adapter instance
 * @param data - Resend verification data (email)
 * @returns Resend verification result with success status or error
 */
export declare function resend_verification_email(adapter: HazoConnectAdapter, data: ResendVerificationData): Promise<ResendVerificationResult>;
//# sourceMappingURL=email_verification_service.d.ts.map