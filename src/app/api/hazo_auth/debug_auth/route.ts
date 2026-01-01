// file_description: Debug endpoint to view current authentication details, user info, roles, permissions, and cookies
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { hazo_get_auth } from "../../../../lib/auth/hazo_get_auth.server";
import { get_hazo_connect_instance } from "../../../../lib/hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers";
import { get_config_boolean } from "../../../../lib/config/config_loader.server";
import { get_cookie_name, BASE_COOKIE_NAMES } from "../../../../lib/cookies_config.server";

// section: route_config
export const dynamic = "force-dynamic";

// section: api_handler
/**
 * GET /api/hazo_auth/debug_auth
 * 
 * Debug endpoint that provides a pretty-printed JSON view of:
 * - Current user details from hazo_users
 * - Assigned roles (with role names)
 * - Assigned permissions
 * - Current auth-related cookie status
 * - Result of calling hazo_get_auth
 * 
 * This endpoint is only enabled when enable_debug_auth_route is set to true in config.
 * Default: false (disabled for security)
 */
export async function GET(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Check if debug route is enabled
    const enable_debug_auth_route = get_config_boolean(
      "hazo_auth__auth_utility",
      "enable_debug_auth_route",
      false,
    );

    if (!enable_debug_auth_route) {
      logger.warn("debug_auth_endpoint_disabled", {
        filename: get_filename(),
        line_number: get_line_number(),
        message: "Debug auth endpoint is disabled. Set enable_debug_auth_route=true in hazo_auth__auth_utility section to enable.",
      });
      return NextResponse.json(
        { error: "Debug endpoint is disabled. Set enable_debug_auth_route=true in config to enable." },
        { status: 403 }
      );
    }

    // Get hazo_get_auth result
    let hazo_get_auth_result;
    try {
      hazo_get_auth_result = await hazo_get_auth(request);
    } catch (auth_error) {
      const auth_error_message = auth_error instanceof Error ? auth_error.message : "Unknown error";
      hazo_get_auth_result = {
        authenticated: false,
        error: auth_error_message,
      };
    }

    // Get cookie status (using configurable cookie names)
    const cookie_status: Record<string, string | null> = {};
    const auth_cookies = [
      get_cookie_name(BASE_COOKIE_NAMES.SESSION),
      get_cookie_name(BASE_COOKIE_NAMES.USER_ID),
      get_cookie_name(BASE_COOKIE_NAMES.USER_EMAIL),
    ];

    for (const cookie_name of auth_cookies) {
      const cookie = request.cookies.get(cookie_name);
      cookie_status[cookie_name] = cookie?.value || null;
    }

    // If not authenticated, return limited info
    if (!hazo_get_auth_result.authenticated || !hazo_get_auth_result.user) {
      return NextResponse.json(
        {
          authenticated: false,
          cookies: cookie_status,
          hazo_get_auth_result,
          message: "User is not authenticated",
        },
        { status: 200 }
      );
    }

    const user_id = hazo_get_auth_result.user.id;
    const hazoConnect = get_hazo_connect_instance();

    // Fetch full user details from database
    const users_service = createCrudService(hazoConnect, "hazo_users");
    const users = await users_service.findBy({ id: user_id });
    
    let user_details: Record<string, unknown> | null = null;
    if (Array.isArray(users) && users.length > 0) {
      const user_db = users[0];
      // Exclude sensitive fields
      user_details = {
        id: user_db.id,
        email_address: user_db.email_address,
        name: user_db.name,
        email_verified: user_db.email_verified,
        status: user_db.status, // Database column
        is_active: user_db.status === "active", // Derived for compatibility
        login_attempts: user_db.login_attempts,
        last_logon: user_db.last_logon,
        profile_picture_url: user_db.profile_picture_url,
        profile_source: user_db.profile_source,
        url_on_logon: user_db.url_on_logon,
        created_at: user_db.created_at,
        changed_at: user_db.changed_at,
        // Explicitly exclude password_hash and mfa_secret
      };
    }

    // Fetch user roles with role names
    const user_roles_service = createCrudService(hazoConnect, "hazo_user_roles");
    const roles_service = createCrudService(hazoConnect, "hazo_roles");
    
    const user_roles = await user_roles_service.findBy({ user_id });
    const assigned_roles: Array<{ role_id: string | number; role_name: string }> = [];
    
    if (Array.isArray(user_roles)) {
      for (const user_role of user_roles) {
        const role_id = user_role.role_id as string | number | undefined;
        if (role_id !== undefined) {
          // Fetch role name
          const roles = await roles_service.findBy({ id: role_id });
          if (Array.isArray(roles) && roles.length > 0) {
            const role = roles[0];
            assigned_roles.push({
              role_id,
              role_name: (role.role_name as string) || "Unknown",
            });
          } else {
            assigned_roles.push({
              role_id,
              role_name: "Unknown (role not found)",
            });
          }
        }
      }
    }

    // Fetch permissions (already available from hazo_get_auth_result, but we'll show them explicitly)
    const permissions = hazo_get_auth_result.permissions || [];

    // Build response
    const debug_info = {
      authenticated: true,
      timestamp: new Date().toISOString(),
      cookies: cookie_status,
      hazo_get_auth_result,
      user_details,
      assigned_roles,
      assigned_permissions: permissions,
    };

    // Return pretty-printed JSON
    return NextResponse.json(debug_info, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("debug_auth_endpoint_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error: error_message,
      error_stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch debug information",
        error_message,
      },
      { status: 500 }
    );
  }
}

