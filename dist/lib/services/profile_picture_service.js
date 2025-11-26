import { createCrudService } from "hazo_connect/server";
import gravatarUrl from "gravatar-url";
import { get_profile_picture_config } from "hazo_auth/lib/profile_picture_config.server";
import { get_ui_sizes_config } from "hazo_auth/lib/ui_sizes_config.server";
import { get_file_types_config } from "hazo_auth/lib/file_types_config.server";
import { create_app_logger } from "hazo_auth/lib/app_logger";
import path from "path";
import fs from "fs";
import { map_ui_source_to_db } from "hazo_auth/lib/services/profile_picture_source_mapper";
// section: helpers
/**
 * Generates Gravatar URL from email address
 * @param email - User's email address
 * @param size - Image size in pixels (defaults to config value)
 * @returns Gravatar URL
 */
export function get_gravatar_url(email, size) {
    const uiSizes = get_ui_sizes_config();
    const gravatarSize = size || uiSizes.gravatar_size;
    return gravatarUrl(email, {
        size: gravatarSize,
        default: "identicon",
    });
}
/**
 * Gets library photo categories by reading subdirectories
 * @returns Array of category names
 */
export function get_library_categories() {
    const config = get_profile_picture_config();
    const library_path = path.resolve(process.cwd(), "public", config.library_photo_path.replace(/^\//, ""));
    if (!fs.existsSync(library_path)) {
        return [];
    }
    try {
        const entries = fs.readdirSync(library_path, { withFileTypes: true });
        return entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort();
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.warn("profile_picture_service_read_categories_failed", {
            filename: "profile_picture_service.ts",
            line_number: 0,
            library_path,
            error: error_message,
        });
        return [];
    }
}
/**
 * Gets photos in a specific library category
 * @param category - Category name
 * @returns Array of photo URLs (relative to public directory)
 */
export function get_library_photos(category) {
    const config = get_profile_picture_config();
    const category_path = path.resolve(process.cwd(), "public", config.library_photo_path.replace(/^\//, ""), category);
    if (!fs.existsSync(category_path)) {
        return [];
    }
    try {
        const fileTypes = get_file_types_config();
        const allowedExtensions = fileTypes.allowed_image_extensions.map(ext => `.${ext.toLowerCase()}`);
        const entries = fs.readdirSync(category_path, { withFileTypes: true });
        const photos = entries
            .filter((entry) => {
            if (!entry.isFile())
                return false;
            const ext = path.extname(entry.name).toLowerCase();
            return allowedExtensions.includes(ext);
        })
            .map((entry) => `${config.library_photo_path}/${category}/${entry.name}`)
            .sort();
        return photos;
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.warn("profile_picture_service_read_photos_failed", {
            filename: "profile_picture_service.ts",
            line_number: 0,
            category,
            category_path,
            error: error_message,
        });
        return [];
    }
}
/**
 * Gets default profile picture based on configuration priority
 * @param user_email - User's email address
 * @param user_name - User's name (optional)
 * @returns Default profile picture URL and source, or null if no default available
 */
export function get_default_profile_picture(user_email, user_name) {
    const config = get_profile_picture_config();
    if (!config.user_photo_default) {
        return null;
    }
    const uiSizes = get_ui_sizes_config();
    // Try priority 1
    if (config.user_photo_default_priority1 === "gravatar") {
        const gravatar_url = get_gravatar_url(user_email, uiSizes.gravatar_size);
        // Note: We can't check if Gravatar actually exists without making a request
        // For now, we'll always return Gravatar URL and let the browser handle 404
        return {
            profile_picture_url: gravatar_url,
            profile_source: "gravatar",
        };
    }
    else if (config.user_photo_default_priority1 === "library") {
        const categories = get_library_categories();
        if (categories.length > 0) {
            // Use first category, first photo as default
            const photos = get_library_photos(categories[0]);
            if (photos.length > 0) {
                return {
                    profile_picture_url: photos[0],
                    profile_source: "library",
                };
            }
        }
    }
    // Try priority 2 if priority 1 didn't work (only if priority2 is different from priority1)
    const priority1 = config.user_photo_default_priority1;
    const priority2 = config.user_photo_default_priority2;
    if (priority2 && priority2 !== priority1) {
        if (priority2 === "gravatar") {
            const gravatar_url = get_gravatar_url(user_email, uiSizes.gravatar_size);
            return {
                profile_picture_url: gravatar_url,
                profile_source: "gravatar",
            };
        }
        else if (priority2 === "library") {
            const categories = get_library_categories();
            if (categories.length > 0) {
                const photos = get_library_photos(categories[0]);
                if (photos.length > 0) {
                    return {
                        profile_picture_url: photos[0],
                        profile_source: "library",
                    };
                }
            }
        }
    }
    // No default photo available
    return null;
}
/**
 * Updates user profile picture in database
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - User ID
 * @param profile_picture_url - Profile picture URL
 * @param profile_source - Profile picture source type
 * @returns Success status
 */
export async function update_user_profile_picture(adapter, user_id, profile_picture_url, profile_source) {
    try {
        const users_service = createCrudService(adapter, "hazo_users");
        const now = new Date().toISOString();
        // Map UI source value to database enum value
        const db_profile_source = map_ui_source_to_db(profile_source);
        await users_service.updateById(user_id, {
            profile_picture_url,
            profile_source: db_profile_source,
            changed_at: now,
        });
        return { success: true };
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            error: error_message,
        };
    }
}
