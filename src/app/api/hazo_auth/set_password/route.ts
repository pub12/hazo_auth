// file_description: API route for setting password for OAuth-only users
// section: imports
import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { get_hazo_connect_instance } from "../../../../lib/hazo_connect_instance.server";
import { create_app_logger } from "../../../../lib/app_logger";
import { hazo_get_auth } from "../../../../lib/auth/hazo_get_auth.server";
import { user_has_password, set_user_password } from "../../../../lib/services/oauth_service";
import { get_password_requirements_config } from "../../../../lib/password_requirements_config.server";
import { validate_password } from "../../../../lib/utils/password_validator";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers";
import { get_auth_cache } from "../../../../lib/auth/auth_cache";

// section: api_handler
/**
 * POST /api/hazo_auth/set_password
 * Allows OAuth-only users (e.g., Google sign-in users) to set a password
 * This enables them to use email/password login in addition to OAuth
 */
export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Require authentication using hazo_get_auth
    const auth_result = await hazo_get_auth(request);

    if (!auth_result.authenticated) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user_id = auth_result.user.id;

    // Parse request body
    const body = await request.json();
    const { new_password } = body;

    // Validate input
    if (!new_password) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

    // Get hazo_connect instance
    const hazoConnect = get_hazo_connect_instance();

    // Check if user already has a password set
    const has_password = await user_has_password(hazoConnect, user_id);

    if (has_password) {
      return NextResponse.json(
        {
          error: "Password already set. Use Change Password instead.",
          has_password: true,
        },
        { status: 400 }
      );
    }

    // Validate password against requirements
    const password_config = get_password_requirements_config();
    const validation_result = validate_password(new_password, password_config);

    if (!validation_result.valid) {
      return NextResponse.json(
        { error: validation_result.errors.join(". ") },
        { status: 400 }
      );
    }

    // Hash the new password
    const password_hash = await argon2.hash(new_password);

    // Set the password
    const result = await set_user_password(hazoConnect, user_id, password_hash);

    if (!result.success) {
      logger.error("set_password_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        user_id,
        error: result.error,
      });

      return NextResponse.json(
        { error: result.error || "Failed to set password" },
        { status: 500 }
      );
    }

    // Invalidate auth cache for this user
    const auth_cache = get_auth_cache();
    auth_cache.invalidate_user(user_id);

    logger.info("set_password_success", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password set successfully. You can now sign in with email and password.",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("set_password_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Failed to set password. Please try again." },
      { status: 500 }
    );
  }
}
