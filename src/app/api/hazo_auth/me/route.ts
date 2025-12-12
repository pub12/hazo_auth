// file_description: API route to get current authenticated user information with permissions
// This is the standardized endpoint that always returns the same format including permissions
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { hazo_get_auth } from "../../../../lib/auth/hazo_get_auth.server";
import { get_hazo_connect_instance } from "../../../../lib/hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { map_db_source_to_ui } from "../../../../lib/services/profile_picture_source_mapper";
import { create_app_logger } from "../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../lib/utils/api_route_helpers";

// section: api_handler
/**
 * GET /api/hazo_auth/me
 * 
 * Standardized endpoint that returns authenticated user information with permissions.
 * Always returns the same format to prevent downstream variations.
 * 
 * Response format (authenticated):
 * {
 *   authenticated: true,
 *   user_id: string,
 *   email: string,
 *   name: string | null,
 *   email_verified: boolean,
 *   last_logon: string | undefined,
 *   profile_picture_url: string | null,
 *   profile_image: string | null,      // alias for profile_picture_url
 *   avatar_url: string | null,         // alias for profile_picture_url
 *   image: string | null,              // alias for profile_picture_url
 *   profile_source: "upload" | "library" | "gravatar" | "custom" | undefined,
 *   user: { id, email_address, name, is_active, profile_picture_url },
 *   permissions: string[],
 *   permission_ok: boolean,
 *   missing_permissions?: string[],
 * }
 * 
 * Response format (not authenticated):
 * {
 *   authenticated: false
 * }
 */
export async function GET(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Use hazo_get_auth to get user with permissions
    const auth_result = await hazo_get_auth(request);

    // If not authenticated, return false
    if (!auth_result.authenticated) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    // Fetch additional user fields from database (email_verified, last_logon, profile_source)
    const hazoConnect = get_hazo_connect_instance();
    const users_service = createCrudService(hazoConnect, "hazo_users");
    const users = await users_service.findBy({ id: auth_result.user.id });
    
    if (!Array.isArray(users) || users.length === 0) {
      logger.warn("me_endpoint_user_not_found", {
        filename: get_filename(),
        line_number: get_line_number(),
        user_id: auth_result.user.id,
        message: "User found in auth but not in database",
      });
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    const user_db = users[0];

    // Map database profile_source to UI representation
    const profile_source_db = user_db.profile_source as string | null | undefined;
    const profile_source_ui = profile_source_db ? map_db_source_to_ui(profile_source_db) : undefined;

    // Parse auth_providers (comma-separated string to array)
    const auth_providers_str = (user_db.auth_providers as string) || "email";
    const auth_providers = auth_providers_str.split(",").map((p: string) => p.trim());

    // Check if user has a password set
    const password_hash = user_db.password_hash as string;
    const has_password = password_hash !== null && password_hash !== undefined && password_hash !== "";

    // Return unified format with all fields
    const profile_pic = auth_result.user.profile_picture_url;
    return NextResponse.json(
      {
        authenticated: true,
        // Top-level fields for backward compatibility
        user_id: auth_result.user.id,
        email: auth_result.user.email_address,
        name: auth_result.user.name,
        email_verified: user_db.email_verified === true,
        last_logon: (user_db.last_logon as string | null | undefined) || undefined,
        profile_picture_url: profile_pic,
        // Aliases for profile_picture_url (for consuming app compatibility)
        profile_image: profile_pic,
        avatar_url: profile_pic,
        image: profile_pic,
        profile_source: profile_source_ui,
        // OAuth-related fields
        auth_providers,
        has_password,
        google_connected: auth_providers.includes("google"),
        // Permissions and user object (always included)
        user: auth_result.user,
        permissions: auth_result.permissions,
        permission_ok: auth_result.permission_ok,
        missing_permissions: auth_result.missing_permissions,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("me_endpoint_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack: error instanceof Error ? error.stack : undefined,
    });

    // On error, assume not authenticated
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}

