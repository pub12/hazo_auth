import type { HazoConnectAdapter } from "hazo_connect";
export type AppUserDataResult = {
    success: boolean;
    data: Record<string, unknown> | null;
    error?: string;
};
export type UpdateAppUserDataOptions = {
    /** If true, merge new data with existing data. If false, replace entirely. Default: true */
    merge?: boolean;
};
/**
 * Get app_user_data for a user
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user ID to get data for
 * @returns App user data result with data or error
 */
export declare function get_app_user_data(adapter: HazoConnectAdapter, user_id: string): Promise<AppUserDataResult>;
/**
 * Update app_user_data for a user
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user ID to update
 * @param data - Data to store (will be JSON stringified)
 * @param options - Update options (merge or replace)
 * @returns App user data result with updated data or error
 */
export declare function update_app_user_data(adapter: HazoConnectAdapter, user_id: string, data: Record<string, unknown>, options?: UpdateAppUserDataOptions): Promise<AppUserDataResult>;
/**
 * Clear app_user_data for a user (set to null)
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user ID to clear data for
 * @returns App user data result
 */
export declare function clear_app_user_data(adapter: HazoConnectAdapter, user_id: string): Promise<AppUserDataResult>;
//# sourceMappingURL=app_user_data_service.d.ts.map