// file_description: API route to serve library photos from node_modules fallback
// This route is used when library photos haven't been copied to the project's public folder
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_library_photo_path } from "../../../../../../lib/services/profile_picture_service";
import { create_app_logger } from "../../../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../../../lib/utils/api_route_helpers";
import fs from "fs";
import path from "path";

// section: route_config
// Cache library photos for 1 hour (they don't change)
export const dynamic = 'force-dynamic';

// section: constants
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const CACHE_MAX_AGE = 3600; // 1 hour in seconds

// section: api_handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; filename: string }> }
) {
  const logger = create_app_logger();
  const { category, filename } = await params;

  try {
    // Validate inputs to prevent path traversal
    if (
      category.includes("..") || 
      category.includes("/") || 
      category.includes("\\") ||
      filename.includes("..") || 
      filename.includes("/") || 
      filename.includes("\\")
    ) {
      logger.warn("library_photo_invalid_path", {
        filename: get_filename(),
        line_number: get_line_number(),
        category,
        requested_filename: filename,
      });
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }

    // Get the physical file path
    const photo_path = get_library_photo_path(category, filename);

    if (!photo_path) {
      logger.warn("library_photo_not_found", {
        filename: get_filename(),
        line_number: get_line_number(),
        category,
        requested_filename: filename,
      });
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    // Read the file
    const file_buffer = fs.readFileSync(photo_path);
    const ext = path.extname(filename).toLowerCase();
    const content_type = MIME_TYPES[ext] || "application/octet-stream";

    // Return the image with caching headers
    return new NextResponse(file_buffer, {
      status: 200,
      headers: {
        "Content-Type": content_type,
        "Content-Length": file_buffer.length.toString(),
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, immutable`,
        "X-Library-Source": "node_modules",
      },
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("library_photo_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      category,
      requested_filename: filename,
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Failed to serve photo" },
      { status: 500 }
    );
  }
}

