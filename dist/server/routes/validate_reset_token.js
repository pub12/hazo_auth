// file_description: API route handler for validating password reset token
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../lib/hazo_connect_instance.server";
import { validate_password_reset_token } from "../../lib/services/password_reset_service";
import { create_app_logger } from "../../lib/app_logger";
import { get_filename, get_line_number } from "../../lib/utils/api_route_helpers";
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
            logger.warn("password_reset_token_validation_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                error: "Token is required",
            });
            return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 });
        }
        // Get singleton hazo_connect instance (reuses same connection across all routes)
        const hazoConnect = get_hazo_connect_instance();
        // Validate token using the password reset service
        const result = await validate_password_reset_token(hazoConnect, {
            token,
        });
        if (!result.success) {
            logger.warn("password_reset_token_validation_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                error: result.error,
            });
            return NextResponse.json({
                success: false,
                error: result.error || "Invalid or expired reset token",
            }, { status: 400 });
        }
        return NextResponse.json({
            success: true,
        }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("password_reset_token_validation_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error: error_message,
        });
        return NextResponse.json({
            success: false,
            error: "An error occurred while validating the reset token",
        }, { status: 500 });
    }
}
