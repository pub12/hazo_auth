export type SessionTokenPayload = {
    user_id: string;
    email: string;
    iat: number;
    exp: number;
};
export type ValidateSessionTokenResult = {
    valid: boolean;
    user_id?: string;
    email?: string;
};
/**
 * Creates a JWT session token for a user
 * Token includes user_id, email, issued at time, and expiration
 * @param user_id - User ID
 * @param email - User email address
 * @returns JWT token string
 */
export declare function create_session_token(user_id: string, email: string): Promise<string>;
/**
 * Validates a JWT session token
 * Checks signature and expiration
 * @param token - JWT token string
 * @returns Validation result with user_id and email if valid
 */
export declare function validate_session_token(token: string): Promise<ValidateSessionTokenResult>;
//# sourceMappingURL=session_token_service.d.ts.map