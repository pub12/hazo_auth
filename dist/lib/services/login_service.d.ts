import type { HazoConnectAdapter } from "hazo_connect";
export type LoginData = {
    email: string;
    password: string;
};
export type LoginResult = {
    success: boolean;
    user_id?: string;
    error?: string;
    email_not_verified?: boolean;
    stored_url_on_logon?: string | null;
};
/**
 * Authenticates a user by verifying email and password against hazo_users table
 * @param adapter - The hazo_connect adapter instance
 * @param data - Login data (email, password)
 * @returns Login result with success status and user_id or error
 */
export declare function authenticate_user(adapter: HazoConnectAdapter, data: LoginData): Promise<LoginResult>;
//# sourceMappingURL=login_service.d.ts.map