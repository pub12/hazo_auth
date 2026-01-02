import type { HazoConnectAdapter } from "hazo_connect";
import { type ProfilePictureSourceUI } from "./profile_picture_source_mapper.js";
export type UserUpdateData = {
    name?: string;
    email?: string;
    profile_picture_url?: string;
    profile_source?: ProfilePictureSourceUI;
};
export type UserUpdateResult = {
    success: boolean;
    email_changed?: boolean;
    error?: string;
};
/**
 * Updates user profile information (name, email)
 * If email is changed, sets email_verified to false
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user ID to update
 * @param data - User update data (name, email)
 * @returns User update result with success status, email_changed flag, or error
 */
export declare function update_user_profile(adapter: HazoConnectAdapter, user_id: string, data: UserUpdateData): Promise<UserUpdateResult>;
//# sourceMappingURL=user_update_service.d.ts.map