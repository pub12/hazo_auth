// file_description: API route handler for email verification
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../lib/hazo_connect_instance.server.js";
import { create_app_logger } from "../../lib/app_logger.js";
import { verify_email_token } from "../../lib/services/email_verification_service.js";
import { handle_post_verification } from "../../lib/services/post_verification_service.js";
import { get_filename, get_line_number } from "../../lib/utils/api_route_helpers.js";
// section: route_config
export const dynamic = 'force-dynamic';
// section: api_handler
export async function GET(request) {
    const logger = create_app_logger();
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");
        // Validate input
        if (!token) {
            logger.warn("email_verification_validation_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                has_token: false,
            });
            return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
        }
        // Get singleton hazo_connect instance (reuses same connection across all routes)
        const hazoConnect = get_hazo_connect_instance();
        // Verify email token using the email verification service
        const result = await verify_email_token(hazoConnect, {
            token,
        });
        if (!result.success) {
            logger.warn("email_verification_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                error: result.error,
            });
            return NextResponse.json({ error: result.error || "Email verification failed" }, { status: 400 });
        }
        logger.info("email_verification_successful", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id: result.user_id,
            email: result.email,
        });
        // Handle post-verification flow (check scopes, invitations, etc.)
        const post_verification_result = await handle_post_verification(hazoConnect, result.user_id, result.email);
        logger.info("post_verification_completed", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id: result.user_id,
            action: post_verification_result.action,
            redirect_url: post_verification_result.redirect_url,
            invitation_accepted: post_verification_result.invitation_accepted,
        });
        return NextResponse.json({
            success: true,
            message: "Email verified successfully",
            user_id: result.user_id,
            email: result.email,
            // Post-verification flow results
            action: post_verification_result.action,
            redirect_url: post_verification_result.redirect_url,
            invitation_accepted: post_verification_result.invitation_accepted,
        }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("email_verification_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Email verification failed. Please try again." }, { status: 500 });
    }
}
