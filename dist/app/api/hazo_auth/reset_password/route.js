// file_description: API route for resetting user password using a reset token
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../lib/hazo_connect_instance.server";
import { reset_password } from "../../../../lib/services/password_reset_service";
import { create_app_logger } from "../../../../lib/app_logger";
import { get_password_requirements_config } from "../../../../lib/password_requirements_config.server";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers";
// section: api_handler
export async function POST(request) {
    const logger = create_app_logger();
    try {
        const body = await request.json();
        const { token, new_password } = body;
        // Validate input
        if (!token) {
            logger.warn("password_reset_validation_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                error: "Token is required",
            });
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }
        if (!new_password) {
            logger.warn("password_reset_validation_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                error: "New password is required",
            });
            return NextResponse.json({ error: "New password is required" }, { status: 400 });
        }
        // Get singleton hazo_connect instance (reuses same connection across all routes)
        const hazoConnect = get_hazo_connect_instance();
        // Get password requirements from config
        const passwordRequirements = get_password_requirements_config();
        // Reset password using the password reset service
        const result = await reset_password(hazoConnect, {
            token,
            new_password,
            minimum_length: passwordRequirements.minimum_length,
        });
        if (!result.success) {
            logger.warn("password_reset_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                error: result.error,
            });
            return NextResponse.json({
                success: false,
                error: result.error || "Failed to reset password",
            }, { status: 400 });
        }
        logger.info("password_reset_successful", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id: result.user_id,
            email: result.email,
        });
        return NextResponse.json({
            success: true,
            message: "Password has been reset successfully",
        }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("password_reset_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error: error_message,
        });
        return NextResponse.json({
            success: false,
            error: "An error occurred while resetting your password",
        }, { status: 500 });
    }
}
