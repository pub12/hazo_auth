// file_description: API route for changing user password
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../lib/hazo_connect_instance.server";
import { create_app_logger } from "../../../../lib/app_logger";
import { change_password } from "../../../../lib/services/password_change_service";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers";
import { require_auth } from "../../../../lib/auth/auth_utils.server";
import { get_auth_cache } from "../../../../lib/auth/auth_cache";
import { get_auth_utility_config } from "../../../../lib/auth_utility_config.server";

// section: api_handler
export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Use centralized auth check
    let user_id: string;
    try {
      const user = await require_auth(request);
      user_id = user.user_id;
    } catch (error) {
      if (error instanceof Error && error.message === "Authentication required") {
        logger.warn("password_change_authentication_failed", {
          filename: get_filename(),
          line_number: get_line_number(),
          error: "User not authenticated",
        });

        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      throw error;
    }

    const body = await request.json();
    const { current_password, new_password } = body;

    // Validate input
    if (!current_password || !new_password) {
      logger.warn("password_change_validation_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        error: "Missing required fields",
        has_current_password: !!current_password,
        has_new_password: !!new_password,
      });

      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Get singleton hazo_connect instance
    const hazoConnect = get_hazo_connect_instance();

    // Change password
    const result = await change_password(hazoConnect, user_id, {
      current_password,
      new_password,
    });

    if (!result.success) {
      logger.warn("password_change_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        error: result.error,
        user_id,
      });

      return NextResponse.json(
        { error: result.error || "Failed to change password" },
        { status: 400 }
      );
    }

    // Invalidate user cache after password change
    try {
      const config = get_auth_utility_config();
      const cache = get_auth_cache(
        config.cache_max_users,
        config.cache_ttl_minutes,
        config.cache_max_age_minutes,
      );
      cache.invalidate_user(user_id);
    } catch (cache_error) {
      // Log but don't fail password change if cache invalidation fails
      const cache_error_message =
        cache_error instanceof Error ? cache_error.message : "Unknown error";
      logger.warn("password_change_cache_invalidation_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        user_id,
        error: cache_error_message,
      });
    }

    logger.info("password_change_successful", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_message =
      error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("password_change_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Failed to change password. Please try again." },
      { status: 500 }
    );
  }
}

