import type { HazoConnectAdapter } from "hazo_connect";
/**
 * Basic user profile information returned by get_profiles
 * Contains resolved profile picture URL, email, name, and account age
 */
export type UserProfileInfo = {
    user_id: string;
    profile_picture_url: string | null;
    email: string;
    name: string | null;
    days_since_created: number;
};
/**
 * Result type for get_profiles function
 * Includes found profiles and list of IDs that were not found
 */
export type GetProfilesResult = {
    success: boolean;
    profiles: UserProfileInfo[];
    not_found_ids: string[];
    error?: string;
};
/**
 * Retrieves basic profile information for multiple users in a single batch call
 * Useful for chat applications and similar use cases where basic user info is needed
 * @param adapter - The hazo_connect adapter instance
 * @param user_ids - Array of user IDs to retrieve profiles for
 * @returns GetProfilesResult with found profiles and list of not found IDs
 */
export declare function hazo_get_user_profiles(adapter: HazoConnectAdapter, user_ids: string[]): Promise<GetProfilesResult>;
//# sourceMappingURL=user_profiles_service.d.ts.map