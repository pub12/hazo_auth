import type { HazoConnectAdapter } from "hazo_connect";
import { type ProfilePictureSourceUI } from "hazo_auth/lib/services/profile_picture_source_mapper";
export type ProfilePictureSource = ProfilePictureSourceUI;
export type DefaultProfilePictureResult = {
    profile_picture_url: string;
    profile_source: ProfilePictureSource;
};
/**
 * Generates Gravatar URL from email address
 * @param email - User's email address
 * @param size - Image size in pixels (defaults to config value)
 * @returns Gravatar URL
 */
export declare function get_gravatar_url(email: string, size?: number): string;
/**
 * Gets library photo categories by reading subdirectories
 * @returns Array of category names
 */
export declare function get_library_categories(): string[];
/**
 * Gets photos in a specific library category
 * @param category - Category name
 * @returns Array of photo URLs (relative to public directory)
 */
export declare function get_library_photos(category: string): string[];
/**
 * Gets default profile picture based on configuration priority
 * @param user_email - User's email address
 * @param user_name - User's name (optional)
 * @returns Default profile picture URL and source, or null if no default available
 */
export declare function get_default_profile_picture(user_email: string, user_name?: string): DefaultProfilePictureResult | null;
/**
 * Updates user profile picture in database
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - User ID
 * @param profile_picture_url - Profile picture URL
 * @param profile_source - Profile picture source type
 * @returns Success status
 */
export declare function update_user_profile_picture(adapter: HazoConnectAdapter, user_id: string, profile_picture_url: string, profile_source: ProfilePictureSource): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=profile_picture_service.d.ts.map