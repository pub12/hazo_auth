import type { HazoConnectAdapter } from "hazo_connect";
export type TokenType = "refresh" | "password_reset" | "email_verification";
export type CreateTokenParams = {
    adapter: HazoConnectAdapter;
    user_id: string;
    token_type: TokenType;
};
export type CreateTokenResult = {
    success: boolean;
    raw_token?: string;
    error?: string;
};
/**
 * Creates a token for a user and stores it in hazo_refresh_tokens table
 * Invalidates any existing tokens of the same type for the user before creating a new one
 * @param params - Token creation parameters (adapter, user_id, token_type)
 * @returns Token creation result with raw_token (for sending to user) or error
 */
export declare function create_token(params: CreateTokenParams): Promise<CreateTokenResult>;
//# sourceMappingURL=token_service.d.ts.map