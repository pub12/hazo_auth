// file_description: API route for listing library photo categories and photos in categories
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_library_categories, get_library_photos } from "@/lib/services/profile_picture_service";
import { create_app_logger } from "@/lib/app_logger";
import { get_filename, get_line_number } from "@/lib/utils/api_route_helpers";

// section: api_handler
export async function GET(request: NextRequest) {
  const logger = create_app_logger();

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (category) {
      // Return photos in the specified category
      const photos = get_library_photos(category);

      logger.info("library_photos_category_requested", {
        filename: get_filename(),
        line_number: get_line_number(),
        category,
        photoCount: photos.length,
      });

      return NextResponse.json(
        {
          success: true,
          category,
          photos,
        },
        { status: 200 }
      );
    } else {
      // Return list of categories
      const categories = get_library_categories();

      logger.info("library_categories_requested", {
        filename: get_filename(),
        line_number: get_line_number(),
        categoryCount: categories.length,
      });

      return NextResponse.json(
        {
          success: true,
          categories,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("library_photos_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Failed to fetch library photos" },
      { status: 500 }
    );
  }
}

