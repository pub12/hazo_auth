// file_description: Custom OAuth callback handler that creates hazo_auth session after Google sign-in
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { create_app_logger } from "../../../../../../lib/app_logger";
import { create_session_token } from "../../../../../../lib/services/session_token_service";
import { get_filename, get_line_number } from "../../../../../../lib/utils/api_route_helpers";
import { get_login_config } from "../../../../../../lib/login_config.server";

// section: types
type NextAuthToken = {
  email?: string;
  name?: string;
  picture?: string;
  google_id?: string;
  email_verified?: boolean;
  provider?: string;
  hazo_user_id?: string;
};

// section: api_handler
/**
 * Handles the OAuth callback after Google sign-in
 * The user creation/linking is done in NextAuth signIn callback
 * This route just sets the hazo_auth session cookies
 */
export async function GET(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Get the NextAuth token from the session
    const token = (await getToken({ req: request })) as NextAuthToken | null;

    logger.debug("google_callback_token_received", {
      filename: get_filename(),
      line_number: get_line_number(),
      has_token: !!token,
      has_email: !!token?.email,
      has_hazo_user_id: !!token?.hazo_user_id,
      has_google_id: !!token?.google_id,
    });

    if (!token) {
      logger.warn("google_callback_no_token", {
        filename: get_filename(),
        line_number: get_line_number(),
        note: "No NextAuth token found - user may not have completed Google sign-in",
      });

      // Redirect to login with error
      const login_url = new URL("/hazo_auth/login", request.url);
      login_url.searchParams.set("error", "oauth_failed");
      return NextResponse.redirect(login_url);
    }

    // Validate we have the required data
    if (!token.email || !token.hazo_user_id) {
      logger.warn("google_callback_missing_data", {
        filename: get_filename(),
        line_number: get_line_number(),
        has_email: !!token.email,
        has_hazo_user_id: !!token.hazo_user_id,
        has_google_id: !!token.google_id,
      });

      const login_url = new URL("/hazo_auth/login", request.url);
      login_url.searchParams.set("error", "oauth_incomplete");
      return NextResponse.redirect(login_url);
    }

    const user_id = token.hazo_user_id;
    const email = token.email;

    logger.info("google_callback_success", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
      email,
    });

    // Get redirect URL from config
    const loginConfig = get_login_config();
    const redirectUrl = loginConfig.redirectRoute || "/";

    // Create redirect response
    const redirect_url = new URL(redirectUrl, request.url);
    const response = NextResponse.redirect(redirect_url);

    // Set authentication cookies (same as login route)
    response.cookies.set("hazo_auth_user_id", user_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    response.cookies.set("hazo_auth_user_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Create and set JWT session token
    try {
      const session_token = await create_session_token(user_id, email);
      response.cookies.set("hazo_auth_session", session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    } catch (token_error) {
      const token_error_message =
        token_error instanceof Error ? token_error.message : "Unknown error";
      logger.warn("google_callback_session_token_creation_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        user_id,
        email,
        error: token_error_message,
        note: "OAuth login succeeded but session token creation failed - using legacy cookies",
      });
    }

    return response;
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("google_callback_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    const login_url = new URL("/hazo_auth/login", request.url);
    login_url.searchParams.set("error", "oauth_error");
    return NextResponse.redirect(login_url);
  }
}
