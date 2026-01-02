// file_description: API route to serve uploaded profile pictures
// section: imports
import { NextResponse } from "next/server";
import { get_profile_picture_config } from "../../../../../lib/profile_picture_config.server.js";
import fs from "fs";
import path from "path";
// section: api_handler
export async function GET(request, { params }) {
    try {
        const config = get_profile_picture_config();
        if (!config.allow_photo_upload || !config.upload_photo_path) {
            return NextResponse.json({ error: "Profile picture upload is not enabled" }, { status: 404 });
        }
        const { filename } = await params;
        // Validate filename (prevent path traversal)
        if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
            return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
        }
        // Resolve upload path
        const uploadPath = path.isAbsolute(config.upload_photo_path)
            ? config.upload_photo_path
            : path.resolve(process.cwd(), config.upload_photo_path);
        const filePath = path.join(uploadPath, filename);
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }
        // Read file
        const fileBuffer = fs.readFileSync(filePath);
        const fileExt = path.extname(filename).toLowerCase();
        const contentType = fileExt === ".png" ? "image/png" : "image/jpeg";
        // Return file with appropriate content type
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    }
    catch (error) {
        return NextResponse.json({ error: "Failed to serve profile picture" }, { status: 500 });
    }
}
