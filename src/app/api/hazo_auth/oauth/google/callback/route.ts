// file_description: Custom OAuth callback handler that creates hazo_auth session after Google sign-in
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { create_app_logger } from "../../../../../../lib/app_logger";
import { create_session_token } from "../../../../../../lib/services/session_token_service";
import { get_filename, get_line_number } from "../../../../../../lib/utils/api_route_helpers";
import { get_login_config } from "../../../../../../lib/login_config.server";
import { get_cookie_name, get_cookie_options, BASE_COOKIE_NAMES } from "../../../../../../lib/cookies_config.server";
import { get_hazo_connect_instance } from "../../../../../../lib/hazo_connect_instance.server";
import { get_post_login_redirect } from "../../../../../../lib/services/post_verification_service";

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

    // Get redirect URL based on user's scope/invitation status
    const loginConfig = get_login_config();
    const default_redirect = loginConfig.redirectRoute || "/";

    // Check if user needs onboarding (no scope, no invitation = create firm)
    const hazoConnect = get_hazo_connect_instance();
    const { redirect_url: determined_redirect, needs_onboarding } = await get_post_login_redirect(
      hazoConnect,
      user_id,
      email,
      default_redirect,
    );

    logger.info("google_callback_post_login_redirect", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
      email,
      redirect_url: determined_redirect,
      needs_onboarding,
    });

    // Create redirect response
    const redirect_url = new URL(determined_redirect, request.url);
    const response = NextResponse.redirect(redirect_url);

    // Set authentication cookies (same as login route, with configurable prefix and domain)
    const base_cookie_options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    };
    const cookie_options = get_cookie_options(base_cookie_options);

    response.cookies.set(get_cookie_name(BASE_COOKIE_NAMES.USER_ID), user_id, cookie_options);
    response.cookies.set(get_cookie_name(BASE_COOKIE_NAMES.USER_EMAIL), email, cookie_options);

    // Create and set JWT session token
    try {
      const session_token = await create_session_token(user_id, email);
      response.cookies.set(get_cookie_name(BASE_COOKIE_NAMES.SESSION), session_token, cookie_options);
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
