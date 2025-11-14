// file_description: API route for updating user profile information
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "@/lib/hazo_connect_instance.server";
import { create_app_logger } from "@/lib/app_logger";
import { update_user_profile } from "@/lib/services/user_update_service";
import { get_filename, get_line_number } from "@/lib/utils/api_route_helpers";
import { require_auth } from "@/lib/auth/auth_utils.server";

// section: api_handler
export async function PATCH(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Use centralized auth check
    let user_id: string;
    try {
      const user = await require_auth(request);
      user_id = user.user_id;
    } catch (error) {
      if (error instanceof Error && error.message === "Authentication required") {
        logger.warn("user_update_authentication_failed", {
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
    const { name, email, profile_picture_url, profile_source } = body;

    // Validate input (at least one field must be provided)
    if (name === undefined && email === undefined && profile_picture_url === undefined) {
      logger.warn("user_update_validation_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        error: "No fields to update",
      });

      return NextResponse.json(
        { error: "At least one field (name, email, or profile_picture_url) must be provided" },
        { status: 400 }
      );
    }

    // Get singleton hazo_connect instance
    const hazoConnect = get_hazo_connect_instance();

    // Update user profile
    const result = await update_user_profile(hazoConnect, user_id, {
      name,
      email,
      profile_picture_url,
      profile_source,
    });

    if (!result.success) {
      logger.warn("user_update_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        error: result.error,
        user_id,
        email_changed: result.email_changed,
      });

      return NextResponse.json(
        { error: result.error || "Failed to update user profile" },
        { status: 400 }
      );
    }

    logger.info("user_update_successful", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
      email_changed: result.email_changed,
    });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        email_changed: result.email_changed,
      },
      { status: 200 }
    );

    // If email changed, update the cookie (match login route cookie settings)
    if (result.email_changed && email) {
      response.cookies.set("hazo_auth_user_email", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    const error_message =
      error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("user_update_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Failed to update user profile. Please try again." },
      { status: 500 }
    );
  }
}

