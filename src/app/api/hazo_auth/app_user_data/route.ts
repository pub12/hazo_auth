// file_description: API route for managing app_user_data (custom application-specific user data)
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../lib/hazo_connect_instance.server";
import { create_app_logger } from "../../../../lib/app_logger";
import {
  get_app_user_data,
  update_app_user_data,
  clear_app_user_data,
} from "../../../../lib/services/app_user_data_service";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers";
import { require_auth } from "../../../../lib/auth/auth_utils.server";

// section: api_handlers

/**
 * GET /api/hazo_auth/app_user_data
 *
 * Returns the current app_user_data for the authenticated user.
 *
 * Response format:
 * { success: true, data: {...} | null }
 */
export async function GET(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Require authentication
    let user_id: string;
    try {
      const user = await require_auth(request);
      user_id = user.user_id;
    } catch (error) {
      if (error instanceof Error && error.message === "Authentication required") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      throw error;
    }

    const hazoConnect = get_hazo_connect_instance();
    const result = await get_app_user_data(hazoConnect, user_id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to get app user data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("app_user_data_get_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json(
      { error: "Failed to get app user data" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/hazo_auth/app_user_data
 *
 * Merges new data with existing app_user_data.
 *
 * Request body:
 * { data: {...} }
 *
 * Response format:
 * { success: true, data: {...} }
 */
export async function PATCH(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Require authentication
    let user_id: string;
    try {
      const user = await require_auth(request);
      user_id = user.user_id;
    } catch (error) {
      if (error instanceof Error && error.message === "Authentication required") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      throw error;
    }

    const body = await request.json();
    const { data } = body;

    // Validate input
    if (data === undefined || data === null) {
      return NextResponse.json(
        { error: "Data field is required" },
        { status: 400 }
      );
    }

    if (typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json(
        { error: "Data must be an object" },
        { status: 400 }
      );
    }

    const hazoConnect = get_hazo_connect_instance();
    const result = await update_app_user_data(hazoConnect, user_id, data, { merge: true });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update app user data" },
        { status: 400 }
      );
    }

    logger.info("app_user_data_patch_success", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
    });

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("app_user_data_patch_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json(
      { error: "Failed to update app user data" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/hazo_auth/app_user_data
 *
 * Replaces existing app_user_data entirely with new data.
 *
 * Request body:
 * { data: {...} }
 *
 * Response format:
 * { success: true, data: {...} }
 */
export async function PUT(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Require authentication
    let user_id: string;
    try {
      const user = await require_auth(request);
      user_id = user.user_id;
    } catch (error) {
      if (error instanceof Error && error.message === "Authentication required") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      throw error;
    }

    const body = await request.json();
    const { data } = body;

    // Validate input
    if (data === undefined || data === null) {
      return NextResponse.json(
        { error: "Data field is required" },
        { status: 400 }
      );
    }

    if (typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json(
        { error: "Data must be an object" },
        { status: 400 }
      );
    }

    const hazoConnect = get_hazo_connect_instance();
    const result = await update_app_user_data(hazoConnect, user_id, data, { merge: false });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to replace app user data" },
        { status: 400 }
      );
    }

    logger.info("app_user_data_put_success", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
    });

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("app_user_data_put_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json(
      { error: "Failed to replace app user data" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hazo_auth/app_user_data
 *
 * Clears the app_user_data for the authenticated user (sets to null).
 *
 * Response format:
 * { success: true, data: null }
 */
export async function DELETE(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Require authentication
    let user_id: string;
    try {
      const user = await require_auth(request);
      user_id = user.user_id;
    } catch (error) {
      if (error instanceof Error && error.message === "Authentication required") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      throw error;
    }

    const hazoConnect = get_hazo_connect_instance();
    const result = await clear_app_user_data(hazoConnect, user_id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to clear app user data" },
        { status: 400 }
      );
    }

    logger.info("app_user_data_delete_success", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
    });

    return NextResponse.json(
      { success: true, data: null },
      { status: 200 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("app_user_data_delete_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json(
      { error: "Failed to clear app user data" },
      { status: 500 }
    );
  }
}
