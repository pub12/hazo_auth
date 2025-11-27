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
    cache_stats?: {
        hits: number;
        misses: number;
        cache_enabled: boolean;
    };
};
/**
 * Retrieves basic profile information for multiple users in a single batch call
 * Useful for chat applications and similar use cases where basic user info is needed
 * Uses LRU cache with configurable TTL for performance (default: 5 minutes)
 * @param adapter - The hazo_connect adapter instance
 * @param user_ids - Array of user IDs to retrieve profiles for
 * @returns GetProfilesResult with found profiles and list of not found IDs
 */
export declare function hazo_get_user_profiles(adapter: HazoConnectAdapter, user_ids: string[]): Promise<GetProfilesResult>;
/**
 * Invalidates cache for specific user IDs
 * Call this after user profile updates to ensure fresh data on next fetch
 * @param user_ids - Array of user IDs to invalidate from cache
 */
export declare function invalidate_user_profiles_cache(user_ids: string[]): void;
/**
 * Invalidates the entire user profiles cache
 * Use sparingly - prefer invalidating specific users when possible
 */
export declare function invalidate_all_user_profiles_cache(): void;
//# sourceMappingURL=user_profiles_service.d.ts.map