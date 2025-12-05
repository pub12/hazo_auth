// file_description: API route for user login authentication using hazo_connect
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../lib/hazo_connect_instance.server";
import { create_app_logger } from "../../../../lib/app_logger";
import { authenticate_user } from "../../../../lib/services/login_service";
import { createCrudService } from "hazo_connect/server";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers";
import { get_login_config } from "../../../../lib/login_config.server";
import { create_session_token } from "../../../../lib/services/session_token_service";
// section: api_handler
export async function POST(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { email, password, url_on_logon } = body;
        // Validate input
        if (!email || !password) {
            logger.warn("login_validation_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                email: email || "missing",
                has_password: !!password,
            });
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }
        // Validate email format
        const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email_pattern.test(email)) {
            logger.warn("login_invalid_email", {
                filename: get_filename(),
                line_number: get_line_number(),
                email,
            });
            return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
        }
        // Get singleton hazo_connect instance (reuses same connection across all routes)
        const hazoConnect = get_hazo_connect_instance();
        // Authenticate user using the login service
        const result = await authenticate_user(hazoConnect, {
            email,
            password,
        });
        if (!result.success) {
            const status_code = result.error === "Invalid email or password" ? 401 : 500;
            logger.warn("login_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                email,
                error: result.error,
                email_not_verified: result.email_not_verified || false,
            });
            return NextResponse.json({
                error: result.error || "Login failed",
                email_not_verified: result.email_not_verified || false,
            }, { status: status_code });
        }
        // TypeScript assertion: user_id is guaranteed to be present when success is true
        // However, we need to check it to satisfy TypeScript's type checking
        if (!result.user_id) {
            logger.error("login_user_id_missing", {
                filename: get_filename(),
                line_number: get_line_number(),
                email,
                note: "Login succeeded but user_id is missing - this should not happen",
            });
            return NextResponse.json({ error: "Login failed - user ID not found" }, { status: 500 });
        }
        const user_id = result.user_id;
        logger.info("login_successful", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id: user_id,
            email,
        });
        // Reuse the existing hazoConnect instance from above
        const users_service = createCrudService(hazoConnect, "hazo_users");
        const users = await users_service.findBy({
            id: user_id,
        });
        const user = users && users.length > 0 ? users[0] : null;
        const user_name = user === null || user === void 0 ? void 0 : user.name;
        // Determine redirect URL priority:
        // 1. url_on_logon from request body (if valid)
        // 2. stored_url_on_logon from database (if available)
        // 3. redirect_route_on_successful_login from config
        // 4. Default to "/"
        let redirectUrl = "/";
        // Check priority 1: Request body
        if (url_on_logon && typeof url_on_logon === "string" && url_on_logon.startsWith("/") && !url_on_logon.startsWith("//")) {
            redirectUrl = url_on_logon;
        }
        // Check priority 2: Stored URL from DB
        else if (result.stored_url_on_logon && typeof result.stored_url_on_logon === "string") {
            redirectUrl = result.stored_url_on_logon;
        }
        // Check priority 3: Config
        else {
            const loginConfig = get_login_config();
            if (loginConfig.redirectRoute) {
                redirectUrl = loginConfig.redirectRoute;
            }
        }
        // Create response with cookies
        const response = NextResponse.json({
            success: true,
            message: "Login successful",
            user_id: user_id,
            email,
            name: user_name,
            redirectUrl,
        }, { status: 200 });
        // Set authentication cookies
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
        // Create and set JWT session token (for Edge-compatible proxy/middleware)
        try {
            const session_token = await create_session_token(user_id, email);
            response.cookies.set("hazo_auth_session", session_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });
        }
        catch (token_error) {
            // Log error but don't fail login if token creation fails
            // Backward compatibility: existing cookies still work
            const token_error_message = token_error instanceof Error ? token_error.message : "Unknown error";
            logger.warn("login_session_token_creation_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id,
                email,
                error: token_error_message,
                note: "Login succeeded but session token creation failed - using legacy cookies",
            });
        }
        return response;
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("login_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
    }
}
