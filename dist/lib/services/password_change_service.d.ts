import type { HazoConnectAdapter } from "hazo_connect";
export type PasswordChangeData = {
    current_password: string;
    new_password: string;
};
export type PasswordChangeResult = {
    success: boolean;
    error?: string;
};
/**
 * Changes a user's password
 * Verifies the current password, validates the new password, and updates the password hash
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user ID to update
 * @param data - Password change data (current_password, new_password)
 * @returns Password change result with success status or error
 */
export declare function change_password(adapter: HazoConnectAdapter, user_id: string, data: PasswordChangeData): Promise<PasswordChangeResult>;
//# sourceMappingURL=password_change_service.d.ts.map