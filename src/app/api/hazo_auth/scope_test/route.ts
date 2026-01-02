// file_description: API route for testing hazo_get_auth with HRBAC scope options
// Uses unified hazo_scopes table with parent_id hierarchy

// section: imports
import { NextRequest, NextResponse } from "next/server";
import { hazo_get_auth } from "../../../../lib/auth/hazo_get_auth.server";
import { is_hrbac_enabled } from "../../../../lib/scope_hierarchy_config.server";
import { PermissionError, ScopeAccessError } from "../../../../lib/auth/auth_types";

// section: route_config
export const dynamic = "force-dynamic";

// section: api_handler
/**
 * GET - Test hazo_get_auth with scope options
 * Query params:
 * - scope_id: string (optional) - The scope ID to test access against
 * - required_permissions: string[] (optional, can repeat)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if HRBAC is enabled
    if (!is_hrbac_enabled()) {
      return NextResponse.json(
        {
          success: false,
          error: "HRBAC is not enabled",
          code: "HRBAC_DISABLED",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scope_id = searchParams.get("scope_id") || undefined;
    const required_permissions = searchParams.getAll("required_permissions").filter((p) => p.trim());

    // Build options
    const options: {
      scope_id?: string;
      required_permissions?: string[];
      strict?: boolean;
    } = {};

    if (scope_id) options.scope_id = scope_id;
    if (required_permissions.length > 0) options.required_permissions = required_permissions;
    options.strict = false; // Don't throw errors in test mode

    // Call hazo_get_auth
    const result = await hazo_get_auth(request, options);

    return NextResponse.json({
      success: true,
      authenticated: result.authenticated,
      permission_ok: result.permission_ok,
      missing_permissions: result.authenticated ? result.missing_permissions : undefined,
      scope_ok: result.scope_ok,
      scope_access_via: result.authenticated ? result.scope_access_via : undefined,
      user: result.user
        ? {
            id: result.user.id,
            email_address: result.user.email_address,
            name: result.user.name,
          }
        : null,
      permissions: result.permissions,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      return NextResponse.json({
        success: false,
        authenticated: true,
        permission_ok: false,
        missing_permissions: error.missing_permissions,
        error: error.message,
      });
    }

    if (error instanceof ScopeAccessError) {
      return NextResponse.json({
        success: false,
        authenticated: true,
        permission_ok: true,
        scope_ok: false,
        error: error.message,
        scope_id: error.scope_id,
      });
    }

    const error_message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        permission_ok: false,
        error: error_message,
      },
      { status: 500 }
    );
  }
}
