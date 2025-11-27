// file_description: API route for listing library photo categories and photos in categories with pagination support
// section: imports
import { NextResponse } from "next/server";
import { get_library_categories, get_library_photos_paginated, get_library_source } from "../../../../lib/services/profile_picture_service";
import { create_app_logger } from "../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers";
// section: route_config
export const dynamic = 'force-dynamic';
// section: constants
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
// section: api_handler
export async function GET(request) {
    const logger = create_app_logger();
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const page_param = searchParams.get("page");
        const page_size_param = searchParams.get("page_size");
        // Parse pagination parameters
        const page = page_param ? Math.max(1, parseInt(page_param, 10) || 1) : 1;
        const page_size = page_size_param
            ? Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(page_size_param, 10) || DEFAULT_PAGE_SIZE))
            : DEFAULT_PAGE_SIZE;
        if (category) {
            // Return photos in the specified category with pagination
            const result = get_library_photos_paginated(category, page, page_size);
            logger.info("library_photos_category_requested", {
                filename: get_filename(),
                line_number: get_line_number(),
                category,
                page,
                page_size,
                total: result.total,
                returned: result.photos.length,
                source: result.source,
            });
            return NextResponse.json({
                success: true,
                category,
                photos: result.photos,
                pagination: {
                    page: result.page,
                    page_size: result.page_size,
                    total: result.total,
                    has_more: result.has_more,
                    total_pages: Math.ceil(result.total / result.page_size),
                },
                source: result.source,
            }, { status: 200 });
        }
        else {
            // Return list of categories
            const categories = get_library_categories();
            const source = get_library_source();
            logger.info("library_categories_requested", {
                filename: get_filename(),
                line_number: get_line_number(),
                categoryCount: categories.length,
                source,
            });
            return NextResponse.json({
                success: true,
                categories,
                source,
            }, { status: 200 });
        }
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("library_photos_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to fetch library photos" }, { status: 500 });
    }
}
