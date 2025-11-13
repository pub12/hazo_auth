// file_description: API route for changing user password
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "@/lib/hazo_connect_instance.server";
import { create_app_logger } from "@/lib/app_logger";
import { change_password } from "@/lib/services/password_change_service";
import { get_filename, get_line_number } from "@/lib/utils/api_route_helpers";

// section: api_handler
export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Get user info from cookies
    const user_id = request.cookies.get("hazo_auth_user_id")?.value;

    if (!user_id) {
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

