import type { HazoConnectAdapter } from "hazo_connect";
import { type ProfilePictureSourceUI } from "./profile_picture_source_mapper.js";
export type ProfilePictureSource = ProfilePictureSourceUI;
export type DefaultProfilePictureResult = {
    profile_picture_url: string;
    profile_source: ProfilePictureSource;
};
export type LibraryPhotosResult = {
    photos: string[];
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
    source: "project" | "node_modules";
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
 * Gets photos in a specific library category with pagination support
 * @param category - Category name
 * @param page - Page number (1-indexed, default 1)
 * @param page_size - Number of photos per page (default 20, max 100)
 * @returns Object with photos array and pagination info
 */
export declare function get_library_photos_paginated(category: string, page?: number, page_size?: number): LibraryPhotosResult;
/**
 * Gets photos in a specific library category (legacy non-paginated version)
 * @param category - Category name
 * @returns Array of photo URLs (relative to public directory or API route)
 */
export declare function get_library_photos(category: string): string[];
/**
 * Gets the physical file path for a library photo (used for serving from node_modules)
 * @param category - Category name
 * @param filename - Photo filename
 * @returns Full file path or null if not found
 */
export declare function get_library_photo_path(category: string, filename: string): string | null;
/**
 * Gets the source of library photos (for diagnostic purposes)
 * @returns Source type or null if no library found
 */
export declare function get_library_source(): "project" | "node_modules" | null;
/**
 * Clears the library path cache (useful for testing or after copying files)
 */
export declare function clear_library_cache(): void;
export declare function get_default_profile_picture(user_email: string, user_name?: string): Promise<DefaultProfilePictureResult | null>;
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