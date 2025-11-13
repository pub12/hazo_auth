// file_description: API route for user logout
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { create_app_logger } from "@/lib/app_logger";
import { get_filename, get_line_number } from "@/lib/utils/api_route_helpers";

// section: api_handler
export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Get user info from cookie before clearing
    const user_email = request.cookies.get("hazo_auth_user_email")?.value;
    const user_id = request.cookies.get("hazo_auth_user_id")?.value;

    // Clear authentication cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 }
    );

    // Clear cookies by setting them to expire in the past
    response.cookies.set("hazo_auth_user_email", "", {
      expires: new Date(0),
      path: "/",
    });
    response.cookies.set("hazo_auth_user_id", "", {
      expires: new Date(0),
      path: "/",
    });

    if (user_email || user_id) {
      logger.info("logout_successful", {
        filename: get_filename(),
        line_number: get_line_number(),
        user_id: user_id || "unknown",
        email: user_email || "unknown",
      });
    }

    return response;
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("logout_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Logout failed. Please try again." },
      { status: 500 }
    );
  }
}

