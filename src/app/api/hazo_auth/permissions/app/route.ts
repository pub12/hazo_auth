// file_description: API route to list all registered app permissions with descriptions
// This endpoint helps with debugging permission denials by showing what permissions are declared
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { hazo_get_auth } from "../../../../../lib/auth/hazo_get_auth.server";
import { get_app_permissions_config } from "../../../../../lib/app_permissions_config.server";

// section: route_config
export const dynamic = "force-dynamic";

// section: api_handler
/**
 * GET /api/hazo_auth/permissions/app
 *
 * Returns all registered app permissions with their descriptions.
 * Useful for debugging permission denials - shows what permissions are declared
 * and their intended purpose.
 *
 * Response format:
 * {
 *   success: true,
 *   permissions: [
 *     { permission_name: "view_reports", description: "Access to view all reports" },
 *     { permission_name: "edit_settings", description: "Ability to modify application settings" }
 *   ]
 * }
 *
 * Requires authentication (any authenticated user can view).
 */
export async function GET(request: NextRequest) {
  try {
    const auth_result = await hazo_get_auth(request);

    if (!auth_result.authenticated) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const config = get_app_permissions_config();

    return NextResponse.json({
      success: true,
      permissions: config.permissions,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: error_message }, { status: 500 });
  }
}
