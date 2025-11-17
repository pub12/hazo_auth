// file_description: API route for hazo_get_auth utility (client-side calls)
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { hazo_get_auth } from "@/lib/auth/hazo_get_auth.server";
import { PermissionError } from "@/lib/auth/auth_types";
import { create_app_logger } from "@/lib/app_logger";
import { get_filename, get_line_number } from "@/lib/utils/api_route_helpers";

// section: route_config
export const dynamic = "force-dynamic";

// section: api_handler
/**
 * POST - Get authentication status and permissions
 * Body: { required_permissions?: string[], strict?: boolean }
 */
export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    const body = await request.json();
    const { required_permissions, strict } = body;

    // Validate required_permissions if provided
    if (
      required_permissions !== undefined &&
      (!Array.isArray(required_permissions) ||
        !required_permissions.every((p) => typeof p === "string"))
    ) {
      return NextResponse.json(
        { error: "required_permissions must be an array of strings" },
        { status: 400 },
      );
    }

    // Validate strict if provided
    if (strict !== undefined && typeof strict !== "boolean") {
      return NextResponse.json(
        { error: "strict must be a boolean" },
        { status: 400 },
      );
    }

    // Call hazo_get_auth
    const result = await hazo_get_auth(request, {
      required_permissions,
      strict,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Handle PermissionError (strict mode)
    if (error instanceof PermissionError) {
      logger.warn("auth_utility_permission_error", {
        filename: get_filename(),
        line_number: get_line_number(),
        missing_permissions: error.missing_permissions,
        required_permissions: error.required_permissions,
      });

      return NextResponse.json(
        {
          error: "Permission denied",
          missing_permissions: error.missing_permissions,
          user_friendly_message: error.user_friendly_message,
        },
        { status: 403 },
      );
    }

    // Handle other errors
    const error_message =
      error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("auth_utility_api_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: error_message },
      { status: 500 },
    );
  }
}

