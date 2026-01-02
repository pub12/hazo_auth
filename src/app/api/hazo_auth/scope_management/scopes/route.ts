// file_description: API route for scope management (list, create, update, delete scopes)
// Uses unified hazo_scopes table with parent_id hierarchy

// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../../lib/hazo_connect_instance.server";
import { hazo_get_auth } from "../../../../../lib/auth/hazo_get_auth.server";
import { create_app_logger } from "../../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../../lib/utils/api_route_helpers";
import { is_hrbac_enabled } from "../../../../../lib/scope_hierarchy_config.server";
import {
  get_all_scopes,
  get_scope_by_id,
  create_scope,
  update_scope,
  delete_scope,
  get_scope_tree,
  is_super_admin_scope,
  SUPER_ADMIN_SCOPE_ID,
  type CreateScopeData,
  type UpdateScopeData,
} from "../../../../../lib/services/scope_service";
import { get_user_scopes } from "../../../../../lib/services/user_scope_service";

// section: route_config
export const dynamic = "force-dynamic";

// section: constants
const REQUIRED_PERMISSION = "admin_scope_hierarchy_management";
const GLOBAL_ADMIN_PERMISSION = "hazo_org_global_admin";

// section: types
type AuthCheckResult = {
  authorized: boolean;
  error?: NextResponse;
  is_global_admin?: boolean;
  user_id?: string;
  user_scope_ids?: string[];
};

// section: helpers
async function check_permission(request: NextRequest): Promise<AuthCheckResult> {
  const auth_result = await hazo_get_auth(request, {
    required_permissions: [REQUIRED_PERMISSION],
    strict: false,
  });

  if (!auth_result.authenticated || !auth_result.user) {
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

  // Check if user is global admin (super admin scope or global admin permission)
  const is_global_admin = auth_result.permissions?.includes(GLOBAL_ADMIN_PERMISSION) || false;

  // Get user's scope assignments for filtering
  const adapter = get_hazo_connect_instance();
  const user_scopes_result = await get_user_scopes(adapter, auth_result.user.id);
  const user_scope_ids = user_scopes_result.success
    ? (user_scopes_result.scopes?.map((us) => us.scope_id) || [])
    : [];

  // Check if user is assigned to super admin scope
  const is_super_admin = user_scope_ids.includes(SUPER_ADMIN_SCOPE_ID);

  return {
    authorized: true,
    is_global_admin: is_global_admin || is_super_admin,
    user_id: auth_result.user.id,
    user_scope_ids,
  };
}

// section: api_handler
/**
 * GET - Fetch scopes
 * Query params:
 * - parent_id: string (optional - filter by parent scope)
 * - action: 'list' | 'tree' (optional, default: 'list')
 * - scope_id: string (optional - for 'tree' action, root of tree)
 *
 * Note: Non-global admins can only see scopes they have access to (their assigned scopes and descendants).
 * Global admins (hazo_org_global_admin permission or super admin scope) can view all scopes.
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
    const action = searchParams.get("action") || "list";
    const parent_id = searchParams.get("parent_id");
    const scope_id = searchParams.get("scope_id");

    const adapter = get_hazo_connect_instance();

    if (action === "tree") {
      // Return hierarchical tree structure
      const result = await get_scope_tree(adapter, scope_id || undefined);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      // Filter tree for non-global admins
      let tree = result.tree || [];
      if (!perm_check.is_global_admin && perm_check.user_scope_ids) {
        // For non-global admins, filter to only scopes they have access to
        tree = tree.filter((node) =>
          perm_check.user_scope_ids!.includes(node.id) ||
          is_scope_accessible(node.id, perm_check.user_scope_ids!)
        );
      }

      return NextResponse.json({
        success: true,
        tree,
      });
    }

    // List scopes (optionally filtered by parent_id)
    const result = await get_all_scopes(adapter, parent_id || undefined);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Filter scopes for non-global admins
    let scopes = result.scopes || [];
    if (!perm_check.is_global_admin && perm_check.user_scope_ids) {
      scopes = scopes.filter((scope) =>
        perm_check.user_scope_ids!.includes(scope.id) ||
        is_scope_accessible(scope.id, perm_check.user_scope_ids!)
      );
    }

    logger.info("scope_management_scopes_fetched", {
      filename: get_filename(),
      line_number: get_line_number(),
      parent_id,
      count: scopes.length,
    });

    return NextResponse.json({
      success: true,
      scopes,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("scope_management_scopes_fetch_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to fetch scopes" }, { status: 500 });
  }
}

/**
 * Check if a scope is accessible (simple check - in a real implementation
 * you'd check the hierarchy)
 */
function is_scope_accessible(scope_id: string, user_scope_ids: string[]): boolean {
  // For now, just check direct membership
  // A more complete implementation would walk the hierarchy
  return user_scope_ids.includes(scope_id);
}

/**
 * POST - Create a new scope
 * Body: { name: string, level: string, parent_id?: string }
 *
 * Note: Non-global admins can only create scopes under scopes they manage.
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
    const { name, level, parent_id } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!level || typeof level !== "string" || level.trim().length === 0) {
      return NextResponse.json(
        { error: "level is required and must be a non-empty string (e.g., 'HQ', 'Division', 'Department')" },
        { status: 400 }
      );
    }

    // For non-global admins, verify they have access to the parent scope
    if (!perm_check.is_global_admin && parent_id) {
      if (!perm_check.user_scope_ids?.includes(parent_id)) {
        return NextResponse.json(
          { error: "You don't have permission to create scopes under this parent" },
          { status: 403 }
        );
      }
    }

    // For non-global admins creating a root scope, deny
    if (!perm_check.is_global_admin && !parent_id) {
      return NextResponse.json(
        { error: "Only global admins can create root-level scopes" },
        { status: 403 }
      );
    }

    const adapter = get_hazo_connect_instance();
    const create_data: CreateScopeData = {
      name: name.trim(),
      level: level.trim(),
      parent_id: parent_id || null,
    };

    const result = await create_scope(adapter, create_data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("scope_management_scope_created", {
      filename: get_filename(),
      line_number: get_line_number(),
      scope_id: result.scope?.id,
      name: name.trim(),
      level: level.trim(),
      parent_id,
    });

    return NextResponse.json(
      {
        success: true,
        scope: result.scope,
      },
      { status: 201 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("scope_management_scope_create_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to create scope" }, { status: 500 });
  }
}

/**
 * PATCH - Update an existing scope
 * Body: { scope_id: string, name?: string, level?: string, parent_id?: string | null }
 */
export async function PATCH(request: NextRequest) {
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
    const { scope_id, name, level, parent_id } = body;

    if (!scope_id || typeof scope_id !== "string") {
      return NextResponse.json(
        { error: "scope_id is required" },
        { status: 400 }
      );
    }

    // Prevent modifying system scopes
    if (is_super_admin_scope(scope_id)) {
      return NextResponse.json(
        { error: "Cannot modify system scopes" },
        { status: 403 }
      );
    }

    // For non-global admins, verify they have access to the scope
    if (!perm_check.is_global_admin) {
      if (!perm_check.user_scope_ids?.includes(scope_id)) {
        return NextResponse.json(
          { error: "You don't have permission to update this scope" },
          { status: 403 }
        );
      }
    }

    const adapter = get_hazo_connect_instance();
    const update_data: UpdateScopeData = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "name must be a non-empty string" },
          { status: 400 }
        );
      }
      update_data.name = name.trim();
    }

    if (level !== undefined) {
      if (typeof level !== "string" || level.trim().length === 0) {
        return NextResponse.json(
          { error: "level must be a non-empty string" },
          { status: 400 }
        );
      }
      update_data.level = level.trim();
    }

    if (parent_id !== undefined) {
      update_data.parent_id = parent_id;
    }

    if (Object.keys(update_data).length === 0) {
      return NextResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }

    const result = await update_scope(adapter, scope_id, update_data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("scope_management_scope_updated", {
      filename: get_filename(),
      line_number: get_line_number(),
      scope_id,
    });

    return NextResponse.json({
      success: true,
      scope: result.scope,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("scope_management_scope_update_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to update scope" }, { status: 500 });
  }
}

/**
 * DELETE - Delete a scope
 * Query params: scope_id
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
    const scope_id = searchParams.get("scope_id");

    if (!scope_id) {
      return NextResponse.json(
        { error: "scope_id query parameter is required" },
        { status: 400 }
      );
    }

    // Prevent deleting system scopes
    if (is_super_admin_scope(scope_id)) {
      return NextResponse.json(
        { error: "Cannot delete system scopes" },
        { status: 403 }
      );
    }

    // For non-global admins, verify they have access to the scope
    if (!perm_check.is_global_admin) {
      if (!perm_check.user_scope_ids?.includes(scope_id)) {
        return NextResponse.json(
          { error: "You don't have permission to delete this scope" },
          { status: 403 }
        );
      }
    }

    const adapter = get_hazo_connect_instance();
    const result = await delete_scope(adapter, scope_id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("scope_management_scope_deleted", {
      filename: get_filename(),
      line_number: get_line_number(),
      scope_id,
    });

    return NextResponse.json({
      success: true,
      deleted_scope: result.scope,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("scope_management_scope_delete_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to delete scope" }, { status: 500 });
  }
}
