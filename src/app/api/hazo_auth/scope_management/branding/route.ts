// file_description: API route for firm branding management (get, update, delete branding)
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../../lib/hazo_connect_instance.server";
import { hazo_get_auth } from "../../../../../lib/auth/hazo_get_auth.server";
import { create_app_logger } from "../../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../../lib/utils/api_route_helpers";
import { is_branding_enabled } from "../../../../../lib/branding_config.server";
import {
  get_scope_branding,
  get_effective_branding,
  update_branding,
  replace_branding,
  clear_branding,
  type UpdateBrandingData,
} from "../../../../../lib/services/branding_service";
import {
  get_scope_by_id,
  is_system_scope,
  SUPER_ADMIN_SCOPE_ID,
} from "../../../../../lib/services/scope_service";
import { get_user_scopes } from "../../../../../lib/services/user_scope_service";

// section: route_config
export const dynamic = "force-dynamic";

// section: constants
const REQUIRED_PERMISSION = "admin_scope_hierarchy_management";
const FIRM_ADMIN_PERMISSION = "firm_admin";
const GLOBAL_ADMIN_PERMISSION = "hazo_org_global_admin";

// section: types
type AuthCheckResult = {
  authorized: boolean;
  error?: NextResponse;
  is_global_admin?: boolean;
  user_id?: string;
  user_scope_ids?: string[];
  user_root_scope_ids?: string[];
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

  // Check for required permission or firm_admin permission
  const has_scope_permission = auth_result.permission_ok;
  const has_firm_admin = auth_result.permissions?.includes(FIRM_ADMIN_PERMISSION);

  if (!has_scope_permission && !has_firm_admin) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: "Permission denied", missing_permissions: [REQUIRED_PERMISSION, FIRM_ADMIN_PERMISSION] },
        { status: 403 }
      ),
    };
  }

  // Check if user is global admin
  const is_global_admin = auth_result.permissions?.includes(GLOBAL_ADMIN_PERMISSION) || false;

  // Get user's scope assignments
  const adapter = get_hazo_connect_instance();
  const user_scopes_result = await get_user_scopes(adapter, auth_result.user.id);
  const user_scopes = user_scopes_result.success ? (user_scopes_result.user_scopes || []) : [];
  const user_scope_ids = user_scopes.map((us) => us.scope_id);
  const user_root_scope_ids = [...new Set(user_scopes.map((us) => us.root_scope_id))];

  // Check if user is assigned to super admin scope
  const is_super_admin = user_scope_ids.includes(SUPER_ADMIN_SCOPE_ID);

  return {
    authorized: true,
    is_global_admin: is_global_admin || is_super_admin,
    user_id: auth_result.user.id,
    user_scope_ids,
    user_root_scope_ids,
  };
}

/**
 * Check if user can manage branding for a specific scope
 * Users can manage branding for root scopes they are assigned to
 */
function can_manage_scope_branding(
  scope_id: string,
  perm_check: AuthCheckResult,
): boolean {
  // Global admins can manage any scope
  if (perm_check.is_global_admin) return true;

  // Users can manage branding for scopes they are in (especially root scopes)
  if (perm_check.user_scope_ids?.includes(scope_id)) return true;

  // Users can manage branding for their root scopes
  if (perm_check.user_root_scope_ids?.includes(scope_id)) return true;

  return false;
}

// section: api_handler
/**
 * GET - Get branding for a scope
 * Query params:
 * - scope_id: string (required) - the scope to get branding for
 * - resolve_inheritance: boolean (optional, default: true) - whether to resolve inheritance
 */
export async function GET(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Check if branding is enabled
    if (!is_branding_enabled()) {
      return NextResponse.json(
        { error: "Firm branding is not enabled", code: "BRANDING_DISABLED" },
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
    const resolve_inheritance = searchParams.get("resolve_inheritance") !== "false";

    if (!scope_id) {
      return NextResponse.json(
        { error: "scope_id query parameter is required" },
        { status: 400 }
      );
    }

    // Verify scope exists and user has access
    const adapter = get_hazo_connect_instance();
    const scope_result = await get_scope_by_id(adapter, scope_id);

    if (!scope_result.success || !scope_result.scope) {
      return NextResponse.json(
        { error: "Scope not found" },
        { status: 404 }
      );
    }

    // Check access (read access is more permissive)
    if (!perm_check.is_global_admin && !perm_check.user_scope_ids?.includes(scope_id)) {
      // Allow if user is in a child scope of this scope
      const is_accessible = perm_check.user_root_scope_ids?.includes(scope_id);
      if (!is_accessible) {
        return NextResponse.json(
          { error: "You don't have access to this scope's branding" },
          { status: 403 }
        );
      }
    }

    // Get branding (with or without inheritance resolution)
    const result = resolve_inheritance
      ? await get_effective_branding(adapter, scope_id)
      : await get_scope_branding(adapter, scope_id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    logger.info("branding_fetched", {
      filename: get_filename(),
      line_number: get_line_number(),
      scope_id,
      resolve_inheritance,
    });

    return NextResponse.json({
      success: true,
      branding: result.branding,
      scope_id,
      is_inherited: resolve_inheritance && result.scope?.id !== scope_id,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("branding_fetch_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to fetch branding" }, { status: 500 });
  }
}

/**
 * PATCH - Update branding for a scope (merge with existing)
 * Body: { scope_id: string, logo_url?: string, primary_color?: string, secondary_color?: string, tagline?: string }
 */
export async function PATCH(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Check if branding is enabled
    if (!is_branding_enabled()) {
      return NextResponse.json(
        { error: "Firm branding is not enabled", code: "BRANDING_DISABLED" },
        { status: 400 }
      );
    }

    // Check permission
    const perm_check = await check_permission(request);
    if (!perm_check.authorized) {
      return perm_check.error!;
    }

    const body = await request.json();
    const { scope_id, logo_url, primary_color, secondary_color, tagline } = body;

    if (!scope_id || typeof scope_id !== "string") {
      return NextResponse.json(
        { error: "scope_id is required" },
        { status: 400 }
      );
    }

    // Prevent modifying system scopes
    if (is_system_scope(scope_id)) {
      return NextResponse.json(
        { error: "Cannot modify branding for system scopes" },
        { status: 403 }
      );
    }

    // Check if user can manage this scope's branding
    if (!can_manage_scope_branding(scope_id, perm_check)) {
      return NextResponse.json(
        { error: "You don't have permission to update this scope's branding" },
        { status: 403 }
      );
    }

    // Build update data
    const update_data: UpdateBrandingData = {};
    if (logo_url !== undefined) update_data.logo_url = logo_url;
    if (primary_color !== undefined) update_data.primary_color = primary_color;
    if (secondary_color !== undefined) update_data.secondary_color = secondary_color;
    if (tagline !== undefined) update_data.tagline = tagline;

    if (Object.keys(update_data).length === 0) {
      return NextResponse.json(
        { error: "No branding data provided" },
        { status: 400 }
      );
    }

    const adapter = get_hazo_connect_instance();
    const result = await update_branding(adapter, scope_id, update_data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("branding_updated", {
      filename: get_filename(),
      line_number: get_line_number(),
      scope_id,
    });

    return NextResponse.json({
      success: true,
      branding: result.branding,
      scope: result.scope,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("branding_update_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to update branding" }, { status: 500 });
  }
}

/**
 * PUT - Replace branding entirely for a scope
 * Body: { scope_id: string, branding: { logo_url?: string, primary_color?: string, secondary_color?: string, tagline?: string } | null }
 */
export async function PUT(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Check if branding is enabled
    if (!is_branding_enabled()) {
      return NextResponse.json(
        { error: "Firm branding is not enabled", code: "BRANDING_DISABLED" },
        { status: 400 }
      );
    }

    // Check permission
    const perm_check = await check_permission(request);
    if (!perm_check.authorized) {
      return perm_check.error!;
    }

    const body = await request.json();
    const { scope_id, branding } = body;

    if (!scope_id || typeof scope_id !== "string") {
      return NextResponse.json(
        { error: "scope_id is required" },
        { status: 400 }
      );
    }

    // Prevent modifying system scopes
    if (is_system_scope(scope_id)) {
      return NextResponse.json(
        { error: "Cannot modify branding for system scopes" },
        { status: 403 }
      );
    }

    // Check if user can manage this scope's branding
    if (!can_manage_scope_branding(scope_id, perm_check)) {
      return NextResponse.json(
        { error: "You don't have permission to replace this scope's branding" },
        { status: 403 }
      );
    }

    const adapter = get_hazo_connect_instance();
    const result = await replace_branding(adapter, scope_id, branding || null);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("branding_replaced", {
      filename: get_filename(),
      line_number: get_line_number(),
      scope_id,
    });

    return NextResponse.json({
      success: true,
      branding: result.branding,
      scope: result.scope,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("branding_replace_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to replace branding" }, { status: 500 });
  }
}

/**
 * DELETE - Clear branding for a scope
 * Query params: scope_id
 */
export async function DELETE(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Check if branding is enabled
    if (!is_branding_enabled()) {
      return NextResponse.json(
        { error: "Firm branding is not enabled", code: "BRANDING_DISABLED" },
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

    // Prevent modifying system scopes
    if (is_system_scope(scope_id)) {
      return NextResponse.json(
        { error: "Cannot modify branding for system scopes" },
        { status: 403 }
      );
    }

    // Check if user can manage this scope's branding
    if (!can_manage_scope_branding(scope_id, perm_check)) {
      return NextResponse.json(
        { error: "You don't have permission to clear this scope's branding" },
        { status: 403 }
      );
    }

    const adapter = get_hazo_connect_instance();
    const result = await clear_branding(adapter, scope_id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("branding_cleared", {
      filename: get_filename(),
      line_number: get_line_number(),
      scope_id,
    });

    return NextResponse.json({
      success: true,
      scope_id,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("branding_clear_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json({ error: "Failed to clear branding" }, { status: 500 });
  }
}
