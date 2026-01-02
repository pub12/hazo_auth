// file_description: API route for uploading firm logos
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../../../lib/hazo_connect_instance.server";
import { hazo_get_auth } from "../../../../../../lib/auth/hazo_get_auth.server";
import { create_app_logger } from "../../../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../../../lib/utils/api_route_helpers";
import {
  get_branding_config,
  is_branding_enabled,
  is_allowed_logo_format,
  get_max_logo_size_bytes,
} from "../../../../../../lib/branding_config.server";
import { update_branding } from "../../../../../../lib/services/branding_service";
import {
  get_scope_by_id,
  is_system_scope,
  extract_branding,
  SUPER_ADMIN_SCOPE_ID,
} from "../../../../../../lib/services/scope_service";
import { get_user_scopes } from "../../../../../../lib/services/user_scope_service";
import fs from "fs";
import path from "path";

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
        { error: "Permission denied" },
        { status: 403 }
      ),
    };
  }

  // Check if user is global admin
  const is_global_admin = auth_result.permissions?.includes(GLOBAL_ADMIN_PERMISSION) || false;

  // Get user's scope assignments
  const adapter = get_hazo_connect_instance();
  const user_scopes_result = await get_user_scopes(adapter, auth_result.user.id);
  const user_scopes = user_scopes_result.success ? (user_scopes_result.scopes || []) : [];
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
 */
function can_manage_scope_branding(
  scope_id: string,
  perm_check: AuthCheckResult,
): boolean {
  if (perm_check.is_global_admin) return true;
  if (perm_check.user_scope_ids?.includes(scope_id)) return true;
  if (perm_check.user_root_scope_ids?.includes(scope_id)) return true;
  return false;
}

/**
 * Get file extension from MIME type
 */
function get_extension_from_mime(mime_type: string): string | null {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/svg+xml": "svg",
    "image/webp": "webp",
  };
  return mimeToExt[mime_type] || null;
}

// section: api_handler
/**
 * POST - Upload a logo for a scope
 * FormData:
 * - scope_id: string (required)
 * - file: File (required)
 */
export async function POST(request: NextRequest) {
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

    // Parse FormData
    const formData = await request.formData();
    const scope_id = formData.get("scope_id") as string | null;
    const file = formData.get("file") as File | null;

    if (!scope_id) {
      return NextResponse.json(
        { error: "scope_id is required" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Prevent modifying system scopes
    if (is_system_scope(scope_id)) {
      return NextResponse.json(
        { error: "Cannot upload logo for system scopes" },
        { status: 403 }
      );
    }

    // Verify scope exists
    const adapter = get_hazo_connect_instance();
    const scope_result = await get_scope_by_id(adapter, scope_id);

    if (!scope_result.success || !scope_result.scope) {
      return NextResponse.json(
        { error: "Scope not found" },
        { status: 404 }
      );
    }

    // Check if user can manage this scope's branding
    if (!can_manage_scope_branding(scope_id, perm_check)) {
      return NextResponse.json(
        { error: "You don't have permission to upload a logo for this scope" },
        { status: 403 }
      );
    }

    // Validate file type
    const file_extension = get_extension_from_mime(file.type);
    if (!file_extension || !is_allowed_logo_format(file_extension)) {
      const config = get_branding_config();
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed formats: ${config.allowed_logo_formats.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const max_size = get_max_logo_size_bytes();
    if (file.size > max_size) {
      const config = get_branding_config();
      return NextResponse.json(
        {
          error: `File size exceeds maximum allowed size of ${config.max_logo_size_kb}KB`,
        },
        { status: 400 }
      );
    }

    // Get upload config
    const config = get_branding_config();

    // Resolve upload path
    const uploadPath = path.isAbsolute(config.logo_upload_path)
      ? config.logo_upload_path
      : path.resolve(process.cwd(), config.logo_upload_path);

    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${scope_id}_${timestamp}.${file_extension}`;
    const filePath = path.join(uploadPath, fileName);

    // Save file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // Generate URL for the logo
    const logo_url = `/api/hazo_auth/scope_management/branding/logo/${fileName}`;

    // Update scope branding with the new logo URL
    const branding_result = await update_branding(adapter, scope_id, {
      logo_url,
    });

    if (!branding_result.success) {
      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore cleanup errors
      }

      return NextResponse.json(
        { error: branding_result.error || "Failed to update branding" },
        { status: 500 }
      );
    }

    // Delete old logo file if it exists
    const old_branding = extract_branding(scope_result.scope);
    if (old_branding?.logo_url && old_branding.logo_url !== logo_url) {
      try {
        const old_filename = old_branding.logo_url.split("/").pop();
        if (old_filename && old_filename.startsWith(scope_id)) {
          const old_file_path = path.join(uploadPath, old_filename);
          if (fs.existsSync(old_file_path)) {
            fs.unlinkSync(old_file_path);
            logger.info("branding_old_logo_deleted", {
              filename: get_filename(),
              line_number: get_line_number(),
              scope_id,
              old_filename,
            });
          }
        }
      } catch (error) {
        logger.warn("branding_old_logo_delete_failed", {
          filename: get_filename(),
          line_number: get_line_number(),
          scope_id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    logger.info("branding_logo_uploaded", {
      filename: get_filename(),
      line_number: get_line_number(),
      scope_id,
      fileName,
      fileSize: file.size,
    });

    return NextResponse.json({
      success: true,
      logo_url,
      branding: branding_result.branding,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    logger.error("branding_logo_upload_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
    });

    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}

// Note: GET handler for serving logos is in [filename]/route.ts
