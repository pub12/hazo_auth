// file_description: API route for testing RBAC/HRBAC access for any user
// Uses unified hazo_scopes table with parent_id hierarchy

// section: imports
import { NextRequest, NextResponse } from "next/server";
import { hazo_get_auth } from "../../../../lib/auth/hazo_get_auth.server";
import { is_hrbac_enabled } from "../../../../lib/scope_hierarchy_config.server";
import { get_hazo_connect_instance } from "../../../../lib/hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { check_user_scope_access } from "../../../../lib/services/user_scope_service";

// section: route_config
export const dynamic = "force-dynamic";

// section: constants
const REQUIRED_PERMISSION = "admin_test_access";

// section: api_handler
/**
 * GET - Test RBAC/HRBAC access for a specific user
 * Query params:
 * - test_user_id: string (required) - The user ID to test
 * - scope_id: string (optional) - The scope ID to test access against
 * - required_permissions: string[] (optional, can repeat)
 */
export async function GET(request: NextRequest) {
  try {
    // First check if the requesting user has admin_test_access permission
    const authResult = await hazo_get_auth(request, {
      required_permissions: [REQUIRED_PERMISSION],
      strict: false,
    });

    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!authResult.permission_ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Permission denied",
          missing_permissions: authResult.missing_permissions,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const test_user_id = searchParams.get("test_user_id");
    const scope_id = searchParams.get("scope_id") || undefined;
    const required_permissions = searchParams
      .getAll("required_permissions")
      .filter((p) => p.trim());

    if (!test_user_id) {
      return NextResponse.json(
        { success: false, error: "test_user_id is required" },
        { status: 400 }
      );
    }

    // Get the test user's info
    const adapter = get_hazo_connect_instance();
    const users_service = createCrudService(adapter, "hazo_users");
    const user_result = await users_service.findBy({ id: test_user_id });

    if (!Array.isArray(user_result) || user_result.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const test_user = user_result[0] as {
      id: string;
      email_address: string;
      name: string | null;
      status: string; // Database column: 'ACTIVE', 'BLOCKED', 'PENDING'
    };

    // Get user's permissions via roles
    const user_roles_service = createCrudService(adapter, "hazo_user_roles");
    const user_roles_result = await user_roles_service.findBy({ user_id: test_user_id });

    const user_permissions: string[] = [];

    if (Array.isArray(user_roles_result) && user_roles_result.length > 0) {
      const role_ids = (user_roles_result as { role_id: number }[]).map(
        (r) => r.role_id
      );

      // Get permissions for each role
      const role_perms_service = createCrudService(adapter, "hazo_role_permissions");
      for (const role_id of role_ids) {
        const perms_result = await role_perms_service.findBy({ role_id });

        if (Array.isArray(perms_result)) {
          const perm_ids = (perms_result as { permission_id: number }[]).map(
            (p) => p.permission_id
          );

          // Get permission names
          const perms_names_service = createCrudService(adapter, "hazo_permissions");
          for (const perm_id of perm_ids) {
            const perm_result = await perms_names_service.findBy({ id: perm_id });
            if (Array.isArray(perm_result) && perm_result.length > 0) {
              const perm_name = (perm_result[0] as { permission_name: string })
                .permission_name;
              if (!user_permissions.includes(perm_name)) {
                user_permissions.push(perm_name);
              }
            }
          }
        }
      }
    }

    // Check required permissions
    let permission_ok = true;
    const missing_permissions: string[] = [];

    if (required_permissions.length > 0) {
      for (const perm of required_permissions) {
        if (!user_permissions.includes(perm)) {
          permission_ok = false;
          missing_permissions.push(perm);
        }
      }
    }

    // Check scope access if HRBAC is enabled and scope_id provided
    let scope_ok: boolean | undefined = undefined;
    let scope_access_via: { scope_id: string; scope_name?: string } | undefined =
      undefined;

    if (is_hrbac_enabled() && scope_id) {
      const scope_result = await check_user_scope_access(
        adapter,
        test_user_id,
        scope_id
      );

      scope_ok = scope_result.has_access;
      if (scope_result.access_via) {
        scope_access_via = {
          scope_id: scope_result.access_via.scope_id,
          scope_name: scope_result.access_via.scope_name,
        };
      }
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      permission_ok,
      missing_permissions: missing_permissions.length > 0 ? missing_permissions : undefined,
      scope_ok,
      scope_access_via,
      user: {
        id: test_user.id,
        email_address: test_user.email_address,
        name: test_user.name,
      },
      permissions: user_permissions,
    });
  } catch (error) {
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
