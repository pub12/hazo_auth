// file_description: service for removing profile pictures (deleting files and clearing database)
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import { map_db_source_to_ui } from "./profile_picture_source_mapper";
import { get_profile_picture_config } from "../profile_picture_config.server";
import { create_app_logger } from "../app_logger";
import fs from "fs";
import path from "path";

// section: types
export type RemoveProfilePictureResult = {
  success: boolean;
  error?: string;
};

// section: helpers
/**
 * Removes user profile picture
 * - If source is "upload": deletes the uploaded file and clears profile_picture_url and profile_source
 * - If source is "gravatar" or "library": clears profile_picture_url and profile_source
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - User ID
 * @returns Remove result with success status or error
 */
export async function remove_user_profile_picture(
  adapter: HazoConnectAdapter,
  user_id: string,
): Promise<RemoveProfilePictureResult> {
  try {
    const users_service = createCrudService(adapter, "hazo_users");

    // Get current user data
    const users = await users_service.findBy({
      id: user_id,
    });

    if (!Array.isArray(users) || users.length === 0) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const current_user = users[0];
    const profile_picture_url = (current_user.profile_picture_url as string) || null;
    const profile_source_db = (current_user.profile_source as string) || null;

    if (!profile_picture_url || !profile_source_db) {
      // No profile picture to remove
      return {
        success: true,
      };
    }

    // Map database source to UI source
    const profile_source_ui = map_db_source_to_ui(profile_source_db);

    // If source is "upload", delete the file
    if (profile_source_ui === "upload") {
      try {
        const config = get_profile_picture_config();

        if (config.upload_photo_path) {
          // Extract filename from URL (e.g., /api/hazo_auth/profile_picture/user_id.jpg)
          const fileName = profile_picture_url.split("/").pop();

          if (fileName && fileName.startsWith(user_id)) {
            // Resolve upload path
            const uploadPath = path.isAbsolute(config.upload_photo_path)
              ? config.upload_photo_path
              : path.resolve(process.cwd(), config.upload_photo_path);

            const filePath = path.join(uploadPath, fileName);

            // Delete file if it exists
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        }
      } catch (error) {
        // Log error but continue with database update
        const logger = create_app_logger();
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.warn("profile_picture_remove_file_delete_failed", {
          filename: "profile_picture_remove_service.ts",
          line_number: 0,
          user_id,
          profile_picture_url,
          error: error_message,
        });
        // Don't fail the request if file deletion fails - still clear the database
      }
    }

    // Clear profile picture URL and source in database
    // Note: profile_source has a CHECK constraint, so we'll set it to null
    // If the database doesn't allow null, we may need to handle it differently
    const update_data: Record<string, unknown> = {
      changed_at: new Date().toISOString(),
      profile_picture_url: null,
      profile_source: null,
    };

    await users_service.updateById(user_id, update_data);

    return {
      success: true,
    };
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      error: error_message,
    };
  }
}

