// file_description: API route handler for password reset requests
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../lib/hazo_connect_instance.server.js";
import { create_app_logger } from "../../lib/app_logger.js";
import { request_password_reset } from "../../lib/services/password_reset_service.js";
import { get_filename, get_line_number } from "../../lib/utils/api_route_helpers.js";
// section: api_handler
export async function POST(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { email } = body;
        // Validate input
        if (!email) {
            logger.warn("password_reset_validation_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                email: email || "missing",
            });
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }
        // Validate email format
        const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email_pattern.test(email)) {
            logger.warn("password_reset_invalid_email", {
                filename: get_filename(),
                line_number: get_line_number(),
                email,
            });
            return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
        }
        // Get singleton hazo_connect instance (reuses same connection across all routes)
        const hazoConnect = get_hazo_connect_instance();
        // Request password reset using the password reset service
        const result = await request_password_reset(hazoConnect, {
            email,
        });
        if (!result.success) {
            logger.warn("password_reset_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                email,
                error: result.error,
            });
            // Still return 200 OK to prevent email enumeration attacks
            return NextResponse.json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent.",
            }, { status: 200 });
        }
        // Check if this is a Google-only user (no password set)
        if (result.no_password_set) {
            logger.info("password_reset_no_password_set", {
                filename: get_filename(),
                line_number: get_line_number(),
                email,
                note: "User does not have a password set (OAuth-only account)",
            });
            // Return success to prevent email enumeration, but include flag for UI handling
            return NextResponse.json({
                success: true,
                no_password_set: true,
                message: "If an account with that email exists, a password reset link has been sent.",
            }, { status: 200 });
        }
        logger.info("password_reset_requested", {
            filename: get_filename(),
            line_number: get_line_number(),
            email,
        });
        // Always return success to prevent email enumeration attacks
        return NextResponse.json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent.",
        }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("password_reset_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        // Still return 200 OK to prevent email enumeration attacks
        return NextResponse.json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent.",
        }, { status: 200 });
    }
}
