// file_description: service for batch retrieval of basic user profile information for chat applications and similar use cases
// Includes LRU caching with configurable TTL for performance optimization
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import { differenceInDays } from "date-fns";
import { create_app_logger } from "../app_logger";
import { sanitize_error_for_user } from "../utils/error_sanitizer";
import { get_user_profiles_cache } from "./user_profiles_cache";
import { get_user_profiles_cache_config } from "../user_profiles_config.server";

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
  cache_stats?: {
    hits: number;
    misses: number;
    cache_enabled: boolean;
  };
};

// section: helpers

/**
 * Fetches profiles from database for given user IDs
 * @param adapter - The hazo_connect adapter instance
 * @param user_ids - Array of user IDs to fetch
 * @returns Object with profiles and not found IDs
 */
async function fetch_profiles_from_db(
  adapter: HazoConnectAdapter,
  user_ids: string[],
): Promise<{ profiles: UserProfileInfo[]; not_found_ids: string[] }> {
  const users_service = createCrudService(adapter, "hazo_users");

  // Query users by IDs using the 'in' filter
  // PostgREST supports 'in' filter syntax: id=in.(id1,id2,id3)
  const users = await users_service.findBy({
    id: `in.(${user_ids.join(",")})`,
  });

  // Handle case where no users are found
  if (!Array.isArray(users)) {
    return {
      profiles: [],
      not_found_ids: user_ids,
    };
  }

  // Build set of found user IDs for quick lookup
  const found_user_ids = new Set(users.map((user) => user.id as string));

  // Determine which user IDs were not found
  const not_found_ids = user_ids.filter((id) => !found_user_ids.has(id));

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

  return { profiles, not_found_ids };
}

/**
 * Retrieves basic profile information for multiple users in a single batch call
 * Useful for chat applications and similar use cases where basic user info is needed
 * Uses LRU cache with configurable TTL for performance (default: 5 minutes)
 * @param adapter - The hazo_connect adapter instance
 * @param user_ids - Array of user IDs to retrieve profiles for
 * @returns GetProfilesResult with found profiles and list of not found IDs
 */
export async function hazo_get_user_profiles(
  adapter: HazoConnectAdapter,
  user_ids: string[],
): Promise<GetProfilesResult> {
  const logger = create_app_logger();
  const config = get_user_profiles_cache_config();

  try {
    // Handle empty input
    if (!user_ids || user_ids.length === 0) {
      return {
        success: true,
        profiles: [],
        not_found_ids: [],
        cache_stats: {
          hits: 0,
          misses: 0,
          cache_enabled: config.cache_enabled,
        },
      };
    }

    // Remove duplicates from input
    const unique_user_ids = [...new Set(user_ids)];

    // Initialize variables for cache tracking
    let cache_hits = 0;
    let cache_misses = 0;
    let all_profiles: UserProfileInfo[] = [];
    let all_not_found_ids: string[] = [];

    if (config.cache_enabled) {
      // Get cache instance with config settings
      const cache = get_user_profiles_cache(
        config.cache_max_entries,
        config.cache_ttl_minutes,
      );

      // Check cache first
      const { cached, missing_ids } = cache.get_many(unique_user_ids);
      cache_hits = cached.length;
      cache_misses = missing_ids.length;

      // If all profiles were cached, return immediately
      if (missing_ids.length === 0) {
        logger.info("hazo_get_user_profiles_cache_hit_all", {
          filename: "user_profiles_service.ts",
          line_number: 130,
          message: "All profiles served from cache",
          requested_count: unique_user_ids.length,
          cache_hits,
        });

        return {
          success: true,
          profiles: cached,
          not_found_ids: [],
          cache_stats: {
            hits: cache_hits,
            misses: 0,
            cache_enabled: true,
          },
        };
      }

      // Fetch missing profiles from database
      const db_result = await fetch_profiles_from_db(adapter, missing_ids);

      // Cache the newly fetched profiles
      if (db_result.profiles.length > 0) {
        cache.set_many(db_result.profiles);
      }

      // Combine cached and freshly fetched profiles
      all_profiles = [...cached, ...db_result.profiles];
      all_not_found_ids = db_result.not_found_ids;
    } else {
      // Cache disabled - fetch all from database
      cache_misses = unique_user_ids.length;
      const db_result = await fetch_profiles_from_db(adapter, unique_user_ids);
      all_profiles = db_result.profiles;
      all_not_found_ids = db_result.not_found_ids;
    }

    // Log successful retrieval
    logger.info("hazo_get_user_profiles_success", {
      filename: "user_profiles_service.ts",
      line_number: 170,
      message: "Successfully retrieved user profiles",
      requested_count: unique_user_ids.length,
      found_count: all_profiles.length,
      not_found_count: all_not_found_ids.length,
      cache_hits,
      cache_misses,
      cache_enabled: config.cache_enabled,
    });

    return {
      success: true,
      profiles: all_profiles,
      not_found_ids: all_not_found_ids,
      cache_stats: {
        hits: cache_hits,
        misses: cache_misses,
        cache_enabled: config.cache_enabled,
      },
    };
  } catch (error) {
    const user_friendly_error = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "user_profiles_service.ts",
        line_number: 195,
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

/**
 * Invalidates cache for specific user IDs
 * Call this after user profile updates to ensure fresh data on next fetch
 * @param user_ids - Array of user IDs to invalidate from cache
 */
export function invalidate_user_profiles_cache(user_ids: string[]): void {
  const config = get_user_profiles_cache_config();
  if (!config.cache_enabled) {
    return;
  }

  const cache = get_user_profiles_cache(
    config.cache_max_entries,
    config.cache_ttl_minutes,
  );
  cache.invalidate_users(user_ids);
}

/**
 * Invalidates the entire user profiles cache
 * Use sparingly - prefer invalidating specific users when possible
 */
export function invalidate_all_user_profiles_cache(): void {
  const config = get_user_profiles_cache_config();
  if (!config.cache_enabled) {
    return;
  }

  const cache = get_user_profiles_cache(
    config.cache_max_entries,
    config.cache_ttl_minutes,
  );
  cache.invalidate_all();
}
