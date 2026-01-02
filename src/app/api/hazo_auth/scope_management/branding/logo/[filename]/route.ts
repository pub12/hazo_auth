// file_description: API route for serving firm logo files
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { create_app_logger } from "../../../../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../../../../lib/utils/api_route_helpers";
import { get_branding_config } from "../../../../../../../lib/branding_config.server";
import fs from "fs";
import path from "path";

// section: route_config
export const dynamic = "force-dynamic";

// section: api_handler
/**
 * GET - Serve a logo file by filename
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const logger = create_app_logger();

  try {
    const { filename: fileName } = await params;

    if (!fileName) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFileName = path.basename(fileName);

    // Get upload config
    const config = get_branding_config();

    // Resolve upload path
    const uploadPath = path.isAbsolute(config.logo_upload_path)
      ? config.logo_upload_path
      : path.resolve(process.cwd(), config.logo_upload_path);

    const filePath = path.join(uploadPath, sanitizedFileName);

    // Ensure the resolved path is still within the upload directory
    if (!filePath.startsWith(uploadPath)) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      );
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Logo not found" },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type
    const ext = path.extname(sanitizedFileName).toLowerCase().replace(".", "");
    const contentTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      svg: "image/svg+xml",
      webp: "image/webp",
    };
    const contentType = contentTypes[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("branding_logo_serve_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json(
      { error: "Failed to serve logo" },
      { status: 500 }
    );
  }
}
