// file_description: API route for resending email verification using hazo_connect
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../lib/hazo_connect_instance.server";
import { create_app_logger } from "../../../../lib/app_logger";
import { resend_verification_email } from "../../../../lib/services/email_verification_service";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers";

// section: api_handler
export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      logger.warn("resend_verification_validation_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        email: email || "missing",
      });

      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_pattern.test(email)) {
      logger.warn("resend_verification_invalid_email", {
        filename: get_filename(),
        line_number: get_line_number(),
        email,
      });

      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Get singleton hazo_connect instance (reuses same connection across all routes)
    const hazoConnect = get_hazo_connect_instance();

    // Resend verification email using the email verification service
    const result = await resend_verification_email(hazoConnect, {
      email,
    });

    if (!result.success) {
      logger.error("resend_verification_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        email,
        error: result.error,
      });

      // Return error response (500) when email sending fails
      // This is a technical error, not a security issue, so we can reveal it
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to resend verification email",
        },
        { status: 500 }
      );
    }

    logger.info("resend_verification_requested", {
      filename: get_filename(),
      line_number: get_line_number(),
      email,
    });

    // Always return success to prevent email enumeration attacks
    return NextResponse.json(
      {
        success: true,
        message: "If an account with that email exists and is not verified, a verification link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("resend_verification_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    // Still return 200 OK to prevent email enumeration attacks
    return NextResponse.json(
      {
        success: true,
        message: "If an account with that email exists and is not verified, a verification link has been sent.",
      },
      { status: 200 }
    );
  }
}

