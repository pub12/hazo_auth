// file_description: service for batch retrieval of basic user profile information for chat applications and similar use cases
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import { differenceInDays } from "date-fns";
import { create_app_logger } from "../app_logger";
import { sanitize_error_for_user } from "../utils/error_sanitizer";

// section: types
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

// section: helpers
/**
 * Retrieves basic profile information for multiple users in a single batch call
 * Useful for chat applications and similar use cases where basic user info is needed
 * @param adapter - The hazo_connect adapter instance
 * @param user_ids - Array of user IDs to retrieve profiles for
 * @returns GetProfilesResult with found profiles and list of not found IDs
 */
export async function hazo_get_user_profiles(
  adapter: HazoConnectAdapter,
  user_ids: string[],
): Promise<GetProfilesResult> {
  const logger = create_app_logger();

  try {
    // Handle empty input
    if (!user_ids || user_ids.length === 0) {
      return {
        success: true,
        profiles: [],
        not_found_ids: [],
      };
    }

    // Remove duplicates from input
    const unique_user_ids = [...new Set(user_ids)];

    // Create CRUD service for hazo_users table
    const users_service = createCrudService(adapter, "hazo_users");

    // Query users by IDs using the 'in' filter
    // PostgREST supports 'in' filter syntax: id=in.(id1,id2,id3)
    const users = await users_service.findBy({
      id: `in.(${unique_user_ids.join(",")})`,
    });

    // Handle case where no users are found
    if (!Array.isArray(users)) {
    logger.warn("hazo_get_user_profiles_unexpected_response", {
      filename: "user_profiles_service.ts",
      line_number: 70,
      message: "Unexpected response format from database query",
      user_ids: unique_user_ids,
    });

      return {
        success: true,
        profiles: [],
        not_found_ids: unique_user_ids,
      };
    }

    // Build set of found user IDs for quick lookup
    const found_user_ids = new Set(users.map((user) => user.id as string));

    // Determine which user IDs were not found
    const not_found_ids = unique_user_ids.filter((id) => !found_user_ids.has(id));

    // Transform database records to UserProfileInfo
    const now = new Date();
    const profiles: UserProfileInfo[] = users.map((user) => {
      const created_at = user.created_at as string;
      const created_date = new Date(created_at);
      const days_since_created = differenceInDays(now, created_date);

      return {
        user_id: user.id as string,
        profile_picture_url: (user.profile_picture_url as string) || null,
        email: user.email_address as string,
        name: (user.name as string) || null,
        days_since_created,
      };
    });

    // Log successful retrieval
    logger.info("hazo_get_user_profiles_success", {
      filename: "user_profiles_service.ts",
      line_number: 105,
      message: "Successfully retrieved user profiles",
      requested_count: unique_user_ids.length,
      found_count: profiles.length,
      not_found_count: not_found_ids.length,
    });

    return {
      success: true,
      profiles,
      not_found_ids,
    };
  } catch (error) {
    const user_friendly_error = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "user_profiles_service.ts",
        line_number: 122,
        operation: "hazo_get_user_profiles",
        user_ids_count: user_ids?.length || 0,
      },
    });

    return {
      success: false,
      profiles: [],
      not_found_ids: [],
      error: user_friendly_error,
    };
  }
}

