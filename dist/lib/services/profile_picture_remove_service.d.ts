import type { HazoConnectAdapter } from "hazo_connect";
export type RemoveProfilePictureResult = {
    success: boolean;
    error?: string;
};
/**
 * Removes user profile picture
 * - If source is "upload": deletes the uploaded file and clears profile_picture_url and profile_source
 * - If source is "gravatar" or "library": clears profile_picture_url and profile_source
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - User ID
 * @returns Remove result with success status or error
 */
export declare function remove_user_profile_picture(adapter: HazoConnectAdapter, user_id: string): Promise<RemoveProfilePictureResult>;
//# sourceMappingURL=profile_picture_remove_service.d.ts.map