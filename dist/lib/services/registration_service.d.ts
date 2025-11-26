import type { HazoConnectAdapter } from "hazo_connect";
export type RegistrationData = {
    email: string;
    password: string;
    name?: string;
    url_on_logon?: string;
};
export type RegistrationResult = {
    success: boolean;
    user_id?: string;
    error?: string;
};
/**
 * Registers a new user in the database using hazo_connect
 * @param adapter - The hazo_connect adapter instance
 * @param data - Registration data (email, password, optional name)
 * @returns Registration result with success status and user_id or error
 */
export declare function register_user(adapter: HazoConnectAdapter, data: RegistrationData): Promise<RegistrationResult>;
//# sourceMappingURL=registration_service.d.ts.map