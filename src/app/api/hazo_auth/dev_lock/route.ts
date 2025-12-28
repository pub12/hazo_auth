// file_description: API route for dev lock password validation and cookie setting
// section: imports
import { NextRequest, NextResponse } from "next/server";
import {
  validate_dev_lock_password,
  create_dev_lock_cookie,
  get_dev_lock_cookie_name,
} from "../../../../lib/auth/dev_lock_validator.edge";
import { get_dev_lock_config } from "../../../../lib/dev_lock_config.server";
import { get_cookie_options } from "../../../../lib/cookies_config.server";

// section: api_handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Validate password against env var
    const is_valid = validate_dev_lock_password(password);

    if (!is_valid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // Get config for session duration
    const config = get_dev_lock_config();

    // Create signed cookie using the password from env var
    const password_env = process.env.HAZO_AUTH_DEV_LOCK_PASSWORD;
    if (!password_env) {
      // This shouldn't happen since validation passed, but handle it anyway
      return NextResponse.json(
        { error: "Dev lock configuration error" },
        { status: 500 }
      );
    }

    const cookie_data = await create_dev_lock_cookie(
      password_env,
      config.session_duration_days
    );

    // Create response
    const response = NextResponse.json(
      { success: true, message: "Unlocked successfully" },
      { status: 200 }
    );

    // Set the dev lock cookie (with configurable domain)
    const base_cookie_options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: cookie_data.max_age,
    };
    const cookie_options = get_cookie_options(base_cookie_options);
    response.cookies.set(get_dev_lock_cookie_name(), cookie_data.value, cookie_options);

    return response;
  } catch (error) {
    const error_message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Dev lock unlock error:", error_message);

    return NextResponse.json(
      { error: "Unlock failed. Please try again." },
      { status: 500 }
    );
  }
}
