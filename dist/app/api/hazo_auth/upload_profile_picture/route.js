// file_description: API route for uploading profile pictures
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../lib/hazo_connect_instance.server";
import { create_app_logger } from "../../../../lib/app_logger";
import { get_profile_picture_config } from "../../../../lib/profile_picture_config.server";
import { get_file_types_config } from "../../../../lib/file_types_config.server";
import { update_user_profile_picture } from "../../../../lib/services/profile_picture_service";
import { createCrudService } from "hazo_connect/server";
import { map_db_source_to_ui } from "../../../../lib/services/profile_picture_source_mapper";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers";
import fs from "fs";
import path from "path";
// section: api_handler
export async function POST(request) {
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
                logger.warn("profile_picture_upload_authentication_failed", {
                    filename: get_filename(),
                    line_number: get_line_number(),
                    error: "User not authenticated",
                });
                return NextResponse.json({ error: "Authentication required" }, { status: 401 });
            }
            throw error;
        }
        // Check if upload is enabled
        const config = get_profile_picture_config();
        if (!config.allow_photo_upload) {
            logger.warn("profile_picture_upload_disabled", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id,
            });
            return NextResponse.json({ error: "Photo upload is not enabled" }, { status: 403 });
        }
        if (!config.upload_photo_path) {
            logger.warn("profile_picture_upload_path_not_configured", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id,
            });
            return NextResponse.json({ error: "Upload path is not configured" }, { status: 500 });
        }
        // Get FormData
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) {
            logger.warn("profile_picture_upload_no_file", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id,
            });
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        // Validate file type
        const fileTypes = get_file_types_config();
        const fileType = file.type;
        if (!fileTypes.allowed_image_mime_types.includes(fileType)) {
            logger.warn("profile_picture_upload_invalid_type", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id,
                fileType,
            });
            return NextResponse.json({ error: "Invalid file type. Only JPG and PNG files are allowed." }, { status: 400 });
        }
        // Validate file size (should already be compressed client-side, but check server-side too)
        const fileSize = file.size;
        if (fileSize > config.max_photo_size) {
            logger.warn("profile_picture_upload_too_large", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id,
                fileSize,
                maxSize: config.max_photo_size,
            });
            return NextResponse.json({ error: `File size exceeds maximum allowed size of ${config.max_photo_size} bytes` }, { status: 400 });
        }
        // Get current user profile picture info before updating
        const hazoConnect = get_hazo_connect_instance();
        const users_service = createCrudService(hazoConnect, "hazo_users");
        const current_users = await users_service.findBy({ id: user_id });
        let oldProfilePictureUrl = null;
        let oldProfileSource = null;
        if (Array.isArray(current_users) && current_users.length > 0) {
            const current_user = current_users[0];
            oldProfilePictureUrl = current_user.profile_picture_url || null;
            oldProfileSource = current_user.profile_source || null;
        }
        // Determine file extension from MIME type
        const mimeToExt = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
        };
        const fileExtension = mimeToExt[fileType] || "jpg";
        const fileName = `${user_id}.${fileExtension}`;
        // Resolve upload path
        const uploadPath = path.isAbsolute(config.upload_photo_path)
            ? config.upload_photo_path
            : path.resolve(process.cwd(), config.upload_photo_path);
        // Create upload directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        // Save file
        const filePath = path.join(uploadPath, fileName);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);
        // Generate URL (relative to public or absolute)
        // For Next.js, we'll serve from a public route or use absolute path
        // For now, use a relative path that can be served via API or static file serving
        const profilePictureUrl = `/api/hazo_auth/profile_picture/${fileName}`;
        // Update user record
        const updateResult = await update_user_profile_picture(hazoConnect, user_id, profilePictureUrl, "upload");
        if (!updateResult.success) {
            // Clean up uploaded file
            try {
                fs.unlinkSync(filePath);
            }
            catch (error) {
                // Ignore cleanup errors
            }
            logger.warn("profile_picture_upload_update_failed", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id,
                error: updateResult.error,
            });
            return NextResponse.json({ error: updateResult.error || "Failed to update profile picture" }, { status: 500 });
        }
        // Delete old profile picture file if it exists and was an uploaded file
        if (oldProfilePictureUrl && oldProfileSource) {
            const oldSourceUI = map_db_source_to_ui(oldProfileSource);
            // Only delete if the old profile picture was an uploaded file
            if (oldSourceUI === "upload") {
                try {
                    // Extract filename from URL (e.g., /api/hazo_auth/profile_picture/user_id.jpg)
                    const oldFileName = oldProfilePictureUrl.split("/").pop();
                    if (oldFileName) {
                        // Check if it's a user-specific file (starts with user_id)
                        if (oldFileName.startsWith(user_id)) {
                            const oldFilePath = path.join(uploadPath, oldFileName);
                            // Only delete if it's a different file (different extension)
                            if (oldFilePath !== filePath && fs.existsSync(oldFilePath)) {
                                fs.unlinkSync(oldFilePath);
                                logger.info("profile_picture_old_file_deleted", {
                                    filename: get_filename(),
                                    line_number: get_line_number(),
                                    user_id,
                                    oldFileName,
                                });
                            }
                        }
                    }
                }
                catch (error) {
                    // Log error but don't fail the request
                    logger.warn("profile_picture_old_file_delete_failed", {
                        filename: get_filename(),
                        line_number: get_line_number(),
                        user_id,
                        oldProfilePictureUrl,
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                }
            }
        }
        logger.info("profile_picture_upload_successful", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id,
            fileName,
            fileSize,
        });
        return NextResponse.json({
            success: true,
            profile_picture_url: profilePictureUrl,
            message: "Profile picture uploaded successfully",
        }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("profile_picture_upload_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to upload profile picture. Please try again." }, { status: 500 });
    }
}
