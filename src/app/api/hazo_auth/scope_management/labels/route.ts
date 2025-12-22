// file_description: API route for HRBAC scope labels management (get labels, update labels)
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../../lib/hazo_connect_instance.server";
import { hazo_get_auth } from "../../../../../lib/auth/hazo_get_auth.server";
import { create_app_logger } from "../../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../../lib/utils/api_route_helpers";
import {
  is_hrbac_enabled,
  get_scope_hierarchy_config,
} from "../../../../../lib/scope_hierarchy_config.server";
import {
  get_scope_labels,
  get_scope_labels_with_defaults,
  upsert_scope_label,
  batch_upsert_scope_labels,
  delete_scope_label,
} from "../../../../../lib/services/scope_labels_service";
import { is_valid_scope_level, type ScopeLevel } from "../../../../../lib/services/scope_service";

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
  user_org_id?: string | null;
};

// section: helpers
async function check_permission(request: NextRequest): Promise<AuthCheckResult> {
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

  // Check if user is global admin
  const is_global_admin = auth_result.permissions?.includes(GLOBAL_ADMIN_PERMISSION) || false;

  return {
    authorized: true,
    is_global_admin,
    user_org_id: auth_result.user?.org_id || null,
  };
}

// section: api_handler
/**
 * GET - Fetch scope labels for an organization
 * Query params:
 * - org_id: string (optional for global admins, auto-filled for non-global admins)
 * - include_defaults: 'true' | 'false' (optional, default: 'true')
 *
 * Note: Non-global admins can only see labels for their own organization.
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
    let org_id = searchParams.get("org_id");
    const include_defaults = searchParams.get("include_defaults") !== "false";

    // Apply org-based filtering for non-global admins
    if (!perm_check.is_global_admin) {
      org_id = perm_check.user_org_id || null;
      if (!org_id) {
        return NextResponse.json(
          { error: "User is not assigned to an organization" },
          { status: 400 }
        );
      }
    }

    if (!org_id) {
      return NextResponse.json(
        { error: "org_id query parameter is required" },
        { status: 400 }
      );
    }

    const adapter = get_hazo_connect_instance();
    const config = get_scope_hierarchy_config();

    let result;
    if (include_defaults) {
      result = await get_scope_labels_with_defaults(adapter, org_id, config.default_labels);
    } else {
      result = await get_scope_labels(adapter, org_id);
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    logger.info("scope_management_labels_fetched", {
      filename: get_filename(),
      line_number: get_line_number(),
      org_id,
      count: result.labels?.length || 0,
    });

    return NextResponse.json({
      success: true,
      labels: result.labels,
      default_labels: config.default_labels,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("scope_management_labels_fetch_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to fetch scope labels" }, { status: 500 });
  }
}

/**
 * PUT - Upsert scope label(s)
 * Body (single): { org_id: string, scope_type: ScopeLevel, label: string }
 * Body (batch): { org_id: string, labels: Array<{ scope_type: ScopeLevel, label: string }> }
 *
 * Note: Non-global admins can only update labels for their own organization.
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
    let { org_id, scope_type, label, labels } = body;

    // For non-global admins, force org_id to their own org
    if (!perm_check.is_global_admin) {
      org_id = perm_check.user_org_id;
      if (!org_id) {
        return NextResponse.json(
          { error: "User is not assigned to an organization" },
          { status: 400 }
        );
      }
    }

    if (!org_id || typeof org_id !== "string" || org_id.trim().length === 0) {
      return NextResponse.json(
        { error: "org_id is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const adapter = get_hazo_connect_instance();

    // Handle batch update
    if (labels && Array.isArray(labels)) {
      // Filter out items with empty labels and validate the rest
      const validLabels: Array<{ scope_type: ScopeLevel; label: string }> = [];

      for (const item of labels) {
        // Skip items with empty labels (user doesn't want to customize this level)
        if (!item.label || typeof item.label !== "string" || item.label.trim().length === 0) {
          continue;
        }

        // Validate scope_type for non-empty labels
        if (!item.scope_type || !is_valid_scope_level(item.scope_type)) {
          return NextResponse.json(
            { error: `Invalid scope_type: ${item.scope_type}` },
            { status: 400 }
          );
        }

        validLabels.push({
          scope_type: item.scope_type as ScopeLevel,
          label: item.label.trim(),
        });
      }

      // If no valid labels to save, return success (nothing to do)
      if (validLabels.length === 0) {
        logger.info("scope_management_labels_batch_no_changes", {
          filename: get_filename(),
          line_number: get_line_number(),
          org_id,
        });

        return NextResponse.json({
          success: true,
          labels: [],
          message: "No labels to update",
        });
      }

      const result = await batch_upsert_scope_labels(
        adapter,
        org_id.trim(),
        validLabels
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      logger.info("scope_management_labels_batch_updated", {
        filename: get_filename(),
        line_number: get_line_number(),
        org_id,
        count: validLabels.length,
      });

      return NextResponse.json({
        success: true,
        labels: result.labels,
      });
    }

    // Handle single update
    if (!scope_type || !is_valid_scope_level(scope_type)) {
      return NextResponse.json(
        { error: "Valid scope_type is required (hazo_scopes_l1 through hazo_scopes_l7)" },
        { status: 400 }
      );
    }

    if (!label || typeof label !== "string" || label.trim().length === 0) {
      return NextResponse.json(
        { error: "label is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const result = await upsert_scope_label(
      adapter,
      org_id.trim(),
      scope_type as ScopeLevel,
      label.trim()
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("scope_management_label_updated", {
      filename: get_filename(),
      line_number: get_line_number(),
      org_id,
      scope_type,
      label: label.trim(),
    });

    return NextResponse.json({
      success: true,
      label: result.label,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("scope_management_label_update_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to update scope label" }, { status: 500 });
  }
}

/**
 * DELETE - Delete a scope label (revert to default)
 * Query params: org_id, scope_type
 *
 * Note: Non-global admins can only delete labels for their own organization.
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
    let org_id = searchParams.get("org_id");
    const scope_type = searchParams.get("scope_type");

    // For non-global admins, force org_id to their own org
    if (!perm_check.is_global_admin) {
      org_id = perm_check.user_org_id || null;
      if (!org_id) {
        return NextResponse.json(
          { error: "User is not assigned to an organization" },
          { status: 400 }
        );
      }
    }

    if (!org_id) {
      return NextResponse.json(
        { error: "org_id query parameter is required" },
        { status: 400 }
      );
    }

    if (!scope_type || !is_valid_scope_level(scope_type)) {
      return NextResponse.json(
        { error: "Valid scope_type query parameter is required" },
        { status: 400 }
      );
    }

    const adapter = get_hazo_connect_instance();
    const result = await delete_scope_label(adapter, org_id, scope_type as ScopeLevel);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("scope_management_label_deleted", {
      filename: get_filename(),
      line_number: get_line_number(),
      org_id,
      scope_type,
    });

    return NextResponse.json({
      success: true,
      deleted_label: result.label,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("scope_management_label_delete_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to delete scope label" }, { status: 500 });
  }
}
