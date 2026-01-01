// file_description: API route for managing user scope assignments in HRBAC
// Uses unified hazo_scopes table with parent_id hierarchy

// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../../../lib/hazo_connect_instance.server";
import { hazo_get_auth } from "../../../../../../lib/auth/hazo_get_auth.server";
import { create_app_logger } from "../../../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../../../lib/utils/api_route_helpers";
import { is_hrbac_enabled } from "../../../../../../lib/scope_hierarchy_config.server";
import {
  get_user_scopes,
  assign_user_scope,
  remove_user_scope,
  update_user_scopes,
  get_user_direct_scopes,
} from "../../../../../../lib/services/user_scope_service";
import { get_scope_by_id } from "../../../../../../lib/services/scope_service";

// section: route_config
export const dynamic = "force-dynamic";

// section: constants
const REQUIRED_PERMISSION = "admin_user_scope_assignment";

// section: helpers
async function check_permission(request: NextRequest): Promise<{ authorized: boolean; error?: NextResponse }> {
  const auth_result = await hazo_get_auth(request, {
    required_permissions: [REQUIRED_PERMISSION],
    strict: false,
  });

  if (!auth_result.authenticated) {
    return {
      authorized: false,
      error: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  if (!auth_result.permission_ok) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: "Permission denied", missing_permissions: auth_result.missing_permissions },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
}

// section: api_handler
/**
 * GET - Fetch user's scope assignments
 * Query params:
 * - user_id: string (required)
 * - include_details: 'true' | 'false' (optional, default: 'false')
 *   If true, includes scope name and level for each assignment
 */
export async function GET(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Check if HRBAC is enabled
    if (!is_hrbac_enabled()) {
      return NextResponse.json(
        { error: "HRBAC is not enabled", code: "HRBAC_DISABLED" },
        { status: 400 }
      );
    }

    // Check permission
    const perm_check = await check_permission(request);
    if (!perm_check.authorized) {
      return perm_check.error!;
    }

    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const include_details = searchParams.get("include_details") === "true";

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id query parameter is required" },
        { status: 400 }
      );
    }

    const adapter = get_hazo_connect_instance();

    if (include_details) {
      const result = await get_user_direct_scopes(adapter, user_id);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      logger.info("user_management_user_scopes_fetched", {
        filename: get_filename(),
        line_number: get_line_number(),
        user_id,
        count: result.scopes?.length || 0,
        include_details: true,
      });

      return NextResponse.json({
        success: true,
        user_id,
        scopes: result.scopes,
      });
    }

    const result = await get_user_scopes(adapter, user_id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    logger.info("user_management_user_scopes_fetched", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
      count: result.scopes?.length || 0,
    });

    return NextResponse.json({
      success: true,
      user_id,
      user_scopes: result.scopes,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("user_management_user_scopes_fetch_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to fetch user scopes" }, { status: 500 });
  }
}

/**
 * POST - Assign a scope to a user
 * Body: { user_id: string, scope_id: string, role_id: string }
 */
export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Check if HRBAC is enabled
    if (!is_hrbac_enabled()) {
      return NextResponse.json(
        { error: "HRBAC is not enabled", code: "HRBAC_DISABLED" },
        { status: 400 }
      );
    }

    // Check permission
    const perm_check = await check_permission(request);
    if (!perm_check.authorized) {
      return perm_check.error!;
    }

    const body = await request.json();
    const { user_id, scope_id, role_id } = body;

    // Validate required fields
    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    if (!scope_id || typeof scope_id !== "string") {
      return NextResponse.json(
        { error: "scope_id is required" },
        { status: 400 }
      );
    }

    if (!role_id || typeof role_id !== "string") {
      return NextResponse.json(
        { error: "role_id is required" },
        { status: 400 }
      );
    }

    // Verify scope exists
    const adapter = get_hazo_connect_instance();
    const scope_check = await get_scope_by_id(adapter, scope_id);
    if (!scope_check.success) {
      return NextResponse.json(
        { error: "Scope not found" },
        { status: 404 }
      );
    }

    const result = await assign_user_scope(adapter, {
      user_id,
      scope_id,
      role_id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("user_management_user_scope_assigned", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
      scope_id,
      role_id,
    });

    return NextResponse.json(
      {
        success: true,
        user_scope: result.scope,
      },
      { status: 201 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("user_management_user_scope_assign_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to assign scope to user" }, { status: 500 });
  }
}

/**
 * PUT - Bulk update user's scope assignments
 * Replaces all existing assignments with the new set
 * Body: { user_id: string, scopes: Array<{ scope_id: string, role_id: string }> }
 */
export async function PUT(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Check if HRBAC is enabled
    if (!is_hrbac_enabled()) {
      return NextResponse.json(
        { error: "HRBAC is not enabled", code: "HRBAC_DISABLED" },
        { status: 400 }
      );
    }

    // Check permission
    const perm_check = await check_permission(request);
    if (!perm_check.authorized) {
      return perm_check.error!;
    }

    const body = await request.json();
    const { user_id, scopes } = body;

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(scopes)) {
      return NextResponse.json(
        { error: "scopes array is required" },
        { status: 400 }
      );
    }

    // Validate all scopes
    for (const scope of scopes) {
      if (!scope.scope_id || typeof scope.scope_id !== "string") {
        return NextResponse.json(
          { error: "scope_id is required for each scope" },
          { status: 400 }
        );
      }
      if (!scope.role_id || typeof scope.role_id !== "string") {
        return NextResponse.json(
          { error: "role_id is required for each scope" },
          { status: 400 }
        );
      }
    }

    const adapter = get_hazo_connect_instance();
    const result = await update_user_scopes(
      adapter,
      user_id,
      scopes.map((s: { scope_id: string; role_id: string }) => ({
        scope_id: s.scope_id,
        role_id: s.role_id,
      }))
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("user_management_user_scopes_updated", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
      scope_count: scopes.length,
    });

    return NextResponse.json({
      success: true,
      user_id,
      user_scopes: result.scopes,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("user_management_user_scopes_update_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to update user scopes" }, { status: 500 });
  }
}

/**
 * DELETE - Remove a scope assignment from a user
 * Query params: user_id, scope_id
 */
export async function DELETE(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Check if HRBAC is enabled
    if (!is_hrbac_enabled()) {
      return NextResponse.json(
        { error: "HRBAC is not enabled", code: "HRBAC_DISABLED" },
        { status: 400 }
      );
    }

    // Check permission
    const perm_check = await check_permission(request);
    if (!perm_check.authorized) {
      return perm_check.error!;
    }

    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const scope_id = searchParams.get("scope_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id query parameter is required" },
        { status: 400 }
      );
    }

    if (!scope_id) {
      return NextResponse.json(
        { error: "scope_id query parameter is required" },
        { status: 400 }
      );
    }

    const adapter = get_hazo_connect_instance();
    const result = await remove_user_scope(adapter, user_id, scope_id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("user_management_user_scope_removed", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
      scope_id,
    });

    return NextResponse.json({
      success: true,
      removed_scope: result.scope,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("user_management_user_scope_remove_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to remove user scope" }, { status: 500 });
  }
}
