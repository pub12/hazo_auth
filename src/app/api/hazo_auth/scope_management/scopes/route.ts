// file_description: API route for HRBAC scope management (list, create, update, delete scopes)
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../../lib/hazo_connect_instance.server";
import { hazo_get_auth } from "../../../../../lib/auth/hazo_get_auth.server";
import { create_app_logger } from "../../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../../lib/utils/api_route_helpers";
import { is_hrbac_enabled } from "../../../../../lib/scope_hierarchy_config.server";
import {
  get_scopes_by_level,
  get_scope_by_id,
  create_scope,
  update_scope,
  delete_scope,
  get_scope_tree,
  get_all_scope_trees,
  is_valid_scope_level,
  type ScopeLevel,
} from "../../../../../lib/services/scope_service";

// section: route_config
export const dynamic = "force-dynamic";

// section: constants
const REQUIRED_PERMISSION = "admin_scope_hierarchy_management";

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
 * GET - Fetch scopes
 * Query params:
 * - level: ScopeLevel (required unless action=tree or action=tree_all)
 * - org: string (optional, filter by organization - required for action=tree)
 * - action: 'list' | 'tree' | 'tree_all' (optional, default: 'list')
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
    const level = searchParams.get("level");
    const org = searchParams.get("org") || undefined;

    const adapter = get_hazo_connect_instance();

    // Return all scope trees (all orgs, all levels)
    if (action === "tree_all") {
      const result = await get_all_scope_trees(adapter);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        trees: result.trees,
      });
    }

    if (action === "tree") {
      // Return hierarchical tree structure for specific org
      if (!org) {
        return NextResponse.json(
          { error: "org is required for tree view" },
          { status: 400 }
        );
      }

      const result = await get_scope_tree(adapter, org);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        tree: result.tree,
      });
    }

    // List scopes for a level
    if (!level) {
      return NextResponse.json(
        { error: "level query parameter is required" },
        { status: 400 }
      );
    }

    if (!is_valid_scope_level(level)) {
      return NextResponse.json(
        { error: `Invalid scope level: ${level}. Must be hazo_scopes_l1 through hazo_scopes_l7` },
        { status: 400 }
      );
    }

    const result = await get_scopes_by_level(adapter, level as ScopeLevel, org);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    logger.info("scope_management_scopes_fetched", {
      filename: get_filename(),
      line_number: get_line_number(),
      level,
      org,
      count: result.scopes?.length || 0,
    });

    return NextResponse.json({
      success: true,
      scopes: result.scopes,
      level,
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
 * POST - Create a new scope
 * Body: { level: ScopeLevel, org: string, name: string, parent_scope_id?: string }
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
    const { level, org, name, parent_scope_id } = body;

    // Validate required fields
    if (!level || !is_valid_scope_level(level)) {
      return NextResponse.json(
        { error: "Valid level is required (hazo_scopes_l1 through hazo_scopes_l7)" },
        { status: 400 }
      );
    }

    if (!org || typeof org !== "string" || org.trim().length === 0) {
      return NextResponse.json(
        { error: "org is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const adapter = get_hazo_connect_instance();
    const result = await create_scope(adapter, level as ScopeLevel, {
      org: org.trim(),
      name: name.trim(),
      parent_scope_id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("scope_management_scope_created", {
      filename: get_filename(),
      line_number: get_line_number(),
      level,
      scope_id: result.scope?.id,
      org,
      name: name.trim(),
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
 * Body: { level: ScopeLevel, scope_id: string, name?: string, parent_scope_id?: string | null }
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
    const { level, scope_id, name, parent_scope_id } = body;

    // Validate required fields
    if (!level || !is_valid_scope_level(level)) {
      return NextResponse.json(
        { error: "Valid level is required" },
        { status: 400 }
      );
    }

    if (!scope_id || typeof scope_id !== "string") {
      return NextResponse.json(
        { error: "scope_id is required" },
        { status: 400 }
      );
    }

    const adapter = get_hazo_connect_instance();
    const update_data: { name?: string; parent_scope_id?: string | null } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "name must be a non-empty string" },
          { status: 400 }
        );
      }
      update_data.name = name.trim();
    }

    if (parent_scope_id !== undefined) {
      update_data.parent_scope_id = parent_scope_id;
    }

    if (Object.keys(update_data).length === 0) {
      return NextResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }

    const result = await update_scope(adapter, level as ScopeLevel, scope_id, update_data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("scope_management_scope_updated", {
      filename: get_filename(),
      line_number: get_line_number(),
      level,
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
 * Query params: level, scope_id
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
    const level = searchParams.get("level");
    const scope_id = searchParams.get("scope_id");

    if (!level || !is_valid_scope_level(level)) {
      return NextResponse.json(
        { error: "Valid level query parameter is required" },
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
    const result = await delete_scope(adapter, level as ScopeLevel, scope_id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("scope_management_scope_deleted", {
      filename: get_filename(),
      line_number: get_line_number(),
      level,
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
