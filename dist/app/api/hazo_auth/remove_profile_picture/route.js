// file_description: API route for removing profile pictures
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../lib/hazo_connect_instance.server.js";
import { create_app_logger } from "../../../../lib/app_logger.js";
import { remove_user_profile_picture } from "../../../../lib/services/profile_picture_remove_service.js";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers.js";
// section: api_handler
export async function DELETE(request) {
    const logger = create_app_logger();
    try {
        // Use centralized auth check
        let user_id;
        try {
            const { require_auth } = await import("../../../../lib/auth/auth_utils.server");
            const user = await require_auth(request);
            user_id = user.user_id;
        }
        catch (error) {
            if (error instanceof Error && error.message === "Authentication required") {
                logger.warn("profile_picture_remove_authentication_failed", {
                    filename: get_filename(),
                    line_number: get_line_number(),
                    error: "User not authenticated",
                });
                return NextResponse.json({ error: "Authentication required" }, { status: 401 });
            }
            throw error;
        }
        // Get singleton hazo_connect instance
        const hazoConnect = get_hazo_connect_instance();
        // Remove profile picture
        const result = await remove_user_profile_picture(hazoConnect, user_id);
        if (!result.success) {
            logger.warn("profile_picture_remove_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id,
                error: result.error,
            });
            return NextResponse.json({ error: result.error || "Failed to remove profile picture" }, { status: 400 });
        }
        logger.info("profile_picture_remove_successful", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id,
        });
        return NextResponse.json({
            success: true,
            message: "Profile picture removed successfully",
        }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("profile_picture_remove_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to remove profile picture. Please try again." }, { status: 500 });
    }
}
