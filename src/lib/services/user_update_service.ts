// file_description: service for updating user profile information using hazo_connect
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import { map_ui_source_to_db, type ProfilePictureSourceUI } from "./profile_picture_source_mapper";
import { create_app_logger } from "../app_logger";
import { sanitize_error_for_user } from "../utils/error_sanitizer";
import { get_filename, get_line_number } from "../utils/api_route_helpers";

// section: types
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

// section: helpers
/**
 * Updates user profile information (name, email)
 * If email is changed, sets email_verified to false
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user ID to update
 * @param data - User update data (name, email)
 * @returns User update result with success status, email_changed flag, or error
 */
export async function update_user_profile(
  adapter: HazoConnectAdapter,
  user_id: string,
  data: UserUpdateData,
): Promise<UserUpdateResult> {
  try {
    const { name, email } = data;

    // Create CRUD service for hazo_users table
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
    const current_email = current_user.email_address as string;
    const email_changed = email !== undefined && email !== current_email;

    // If email is being changed, check if new email already exists
    if (email_changed) {
      const existing_users = await users_service.findBy({
        email_address: email,
      });

      if (Array.isArray(existing_users) && existing_users.length > 0) {
        // Check if it's the same user
        const existing_user = existing_users[0];
        if (existing_user.id !== user_id) {
          return {
            success: false,
            error: "Email address already registered",
          };
        }
      }

      // Validate email format
      const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email_regex.test(email)) {
        return {
          success: false,
          error: "Invalid email address format",
        };
      }
    }

    // Prepare update data
    const update_data: Record<string, unknown> = {
      changed_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      update_data.name = name;
    }

    if (email !== undefined) {
      update_data.email_address = email;
    }

    if (data.profile_picture_url !== undefined) {
      update_data.profile_picture_url = data.profile_picture_url;
    }

    if (data.profile_source !== undefined) {
      // Map UI source value to database enum value
      update_data.profile_source = map_ui_source_to_db(data.profile_source);
    }

    // If email changed, set email_verified to false
    if (email_changed) {
      update_data.email_verified = false;
    }

    // Update user in database
    await users_service.updateById(user_id, update_data);

    return {
      success: true,
      email_changed,
    };
  } catch (error) {
    const logger = create_app_logger();
    const user_friendly_error = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "user_update_service.ts",
        line_number: get_line_number(),
        user_id,
        operation: "update_user_profile",
      },
    });

    return {
      success: false,
      error: user_friendly_error,
    };
  }
}

