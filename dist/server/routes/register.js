// file_description: API route handler for user registration
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../lib/hazo_connect_instance.server.js";
import { create_app_logger } from "../../lib/app_logger.js";
import { register_user } from "../../lib/services/registration_service.js";
import { get_filename, get_line_number } from "../../lib/utils/api_route_helpers.js";
import { sanitize_error_for_user } from "../../lib/utils/error_sanitizer.js";
// section: api_handler
export async function POST(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { name, email, password, url_on_logon } = body;
        // Validate input
        if (!email || !password) {
            logger.warn("registration_validation_failed", {
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
            logger.warn("registration_invalid_email", {
                filename: get_filename(),
                line_number: get_line_number(),
                email,
            });
            return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
        }
        // Get singleton hazo_connect instance (reuses same connection across all routes)
        const hazoConnect = get_hazo_connect_instance();
        // Register user using the registration service
        const result = await register_user(hazoConnect, {
            email,
            password,
            name,
            url_on_logon,
        });
        if (!result.success) {
            const status_code = result.error === "Email address already registered" ? 409 : 500;
            logger.warn("registration_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                email,
                error: result.error,
            });
            return NextResponse.json({ error: result.error || "Registration failed" }, { status: status_code });
        }
        logger.info("registration_successful", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id: result.user_id,
            email,
            has_name: !!name,
        });
        return NextResponse.json({
            success: true,
            message: "Registration successful",
            user_id: result.user_id,
        }, { status: 201 });
    }
    catch (error) {
        const user_friendly_error = sanitize_error_for_user(error, {
            logToConsole: true,
            logToLogger: true,
            logger,
            context: {
                filename: get_filename(),
                line_number: get_line_number(),
                operation: "register_api_route",
            },
        });
        return NextResponse.json({ error: user_friendly_error }, { status: 500 });
    }
}
