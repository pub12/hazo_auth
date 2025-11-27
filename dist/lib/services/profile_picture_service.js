import { createCrudService } from "hazo_connect/server";
import gravatarUrl from "gravatar-url";
import { get_profile_picture_config } from "../profile_picture_config.server";
import { get_ui_sizes_config } from "../ui_sizes_config.server";
import { get_file_types_config } from "../file_types_config.server";
import { create_app_logger } from "../app_logger";
import path from "path";
import fs from "fs";
import { map_ui_source_to_db } from "./profile_picture_source_mapper";
// section: cache
// Cache the resolved library path to avoid repeated filesystem checks
let cached_library_path = null;
let cached_library_source = null;
// section: helpers
/**
 * Resolves the library path, checking project's public folder first, then node_modules
 * @returns Object with path and source, or null if not found
 */
function resolve_library_path() {
    // Return cached value if available
    if (cached_library_path && cached_library_source) {
        if (fs.existsSync(cached_library_path)) {
            return { path: cached_library_path, source: cached_library_source };
        }
        // Cache is stale, clear it
        cached_library_path = null;
        cached_library_source = null;
    }
    const config = get_profile_picture_config();
    const library_subpath = config.library_photo_path.replace(/^\//, "");
    // Try 1: Project's public folder
    const project_library_path = path.resolve(process.cwd(), "public", library_subpath);
    if (fs.existsSync(project_library_path)) {
        // Check if it has any content (not just empty directory)
        try {
            const entries = fs.readdirSync(project_library_path);
            if (entries.length > 0) {
                cached_library_path = project_library_path;
                cached_library_source = "project";
                return { path: project_library_path, source: "project" };
            }
        }
        catch (_a) {
            // Continue to fallback
        }
    }
    // Try 2: node_modules/hazo_auth/public folder
    const node_modules_library_path = path.resolve(process.cwd(), "node_modules", "hazo_auth", "public", library_subpath);
    if (fs.existsSync(node_modules_library_path)) {
        cached_library_path = node_modules_library_path;
        cached_library_source = "node_modules";
        return { path: node_modules_library_path, source: "node_modules" };
    }
    return null;
}
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
    const resolved = resolve_library_path();
    if (!resolved) {
        return [];
    }
    try {
        const entries = fs.readdirSync(resolved.path, { withFileTypes: true });
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
            library_path: resolved.path,
            source: resolved.source,
            error: error_message,
        });
        return [];
    }
}
/**
 * Gets photos in a specific library category with pagination support
 * @param category - Category name
 * @param page - Page number (1-indexed, default 1)
 * @param page_size - Number of photos per page (default 20, max 100)
 * @returns Object with photos array and pagination info
 */
export function get_library_photos_paginated(category, page = 1, page_size = 20) {
    const resolved = resolve_library_path();
    const config = get_profile_picture_config();
    // Ensure page_size is within bounds
    const effective_page_size = Math.min(Math.max(1, page_size), 100);
    const effective_page = Math.max(1, page);
    if (!resolved) {
        return {
            photos: [],
            total: 0,
            page: effective_page,
            page_size: effective_page_size,
            has_more: false,
            source: "project",
        };
    }
    const category_path = path.join(resolved.path, category);
    if (!fs.existsSync(category_path)) {
        return {
            photos: [],
            total: 0,
            page: effective_page,
            page_size: effective_page_size,
            has_more: false,
            source: resolved.source,
        };
    }
    try {
        const fileTypes = get_file_types_config();
        const allowedExtensions = fileTypes.allowed_image_extensions.map(ext => ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`);
        const entries = fs.readdirSync(category_path, { withFileTypes: true });
        const all_photos = entries
            .filter((entry) => {
            if (!entry.isFile())
                return false;
            const ext = path.extname(entry.name).toLowerCase();
            return allowedExtensions.includes(ext);
        })
            .map((entry) => entry.name)
            .sort();
        const total = all_photos.length;
        const start_index = (effective_page - 1) * effective_page_size;
        const end_index = start_index + effective_page_size;
        const page_photos = all_photos.slice(start_index, end_index);
        // Generate URLs based on source
        // For node_modules source, we need to serve via API route
        const photo_urls = page_photos.map((filename) => {
            if (resolved.source === "node_modules") {
                // Serve via API route that reads from node_modules
                return `/api/hazo_auth/library_photo/${category}/${filename}`;
            }
            else {
                // Serve directly from public folder
                return `${config.library_photo_path}/${category}/${filename}`;
            }
        });
        return {
            photos: photo_urls,
            total,
            page: effective_page,
            page_size: effective_page_size,
            has_more: end_index < total,
            source: resolved.source,
        };
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.warn("profile_picture_service_read_photos_failed", {
            filename: "profile_picture_service.ts",
            line_number: 0,
            category,
            category_path,
            source: resolved.source,
            error: error_message,
        });
        return {
            photos: [],
            total: 0,
            page: effective_page,
            page_size: effective_page_size,
            has_more: false,
            source: resolved.source,
        };
    }
}
/**
 * Gets photos in a specific library category (legacy non-paginated version)
 * @param category - Category name
 * @returns Array of photo URLs (relative to public directory or API route)
 */
export function get_library_photos(category) {
    // Use paginated version with large page size for backwards compatibility
    const result = get_library_photos_paginated(category, 1, 1000);
    return result.photos;
}
/**
 * Gets the physical file path for a library photo (used for serving from node_modules)
 * @param category - Category name
 * @param filename - Photo filename
 * @returns Full file path or null if not found
 */
export function get_library_photo_path(category, filename) {
    const resolved = resolve_library_path();
    if (!resolved) {
        return null;
    }
    const photo_path = path.join(resolved.path, category, filename);
    if (fs.existsSync(photo_path)) {
        return photo_path;
    }
    return null;
}
/**
 * Gets the source of library photos (for diagnostic purposes)
 * @returns Source type or null if no library found
 */
export function get_library_source() {
    var _a;
    const resolved = resolve_library_path();
    return (_a = resolved === null || resolved === void 0 ? void 0 : resolved.source) !== null && _a !== void 0 ? _a : null;
}
/**
 * Clears the library path cache (useful for testing or after copying files)
 */
export function clear_library_cache() {
    cached_library_path = null;
    cached_library_source = null;
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
