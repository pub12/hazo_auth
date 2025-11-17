// file_description: API route for user registration using hazo_connect to insert into hazo_users table
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "@/lib/hazo_connect_instance.server";
import { create_app_logger } from "@/lib/app_logger";
import { register_user } from "@/lib/services/registration_service";
import { get_filename, get_line_number } from "@/lib/utils/api_route_helpers";

// section: api_handler
export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!email || !password) {
      logger.warn("registration_validation_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        email: email || "missing",
        has_password: !!password,
      });

      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_pattern.test(email)) {
      logger.warn("registration_invalid_email", {
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

    // Register user using the registration service
    const result = await register_user(hazoConnect, {
      email,
      password,
      name,
    });

    if (!result.success) {
      const status_code = result.error === "Email address already registered" ? 409 : 500;

      logger.warn("registration_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        email,
        error: result.error,
      });

      return NextResponse.json(
        { error: result.error || "Registration failed" },
        { status: status_code }
      );
    }

    logger.info("registration_successful", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id: result.user_id,
      email,
      has_name: !!name,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user_id: result.user_id,
      },
      { status: 201 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("registration_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

