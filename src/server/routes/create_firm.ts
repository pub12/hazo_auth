// file_description: API route handler for creating a new firm (root scope) for authenticated users
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../lib/hazo_connect_instance.server";
import { create_app_logger } from "../../lib/app_logger";
import { get_filename, get_line_number } from "../../lib/utils/api_route_helpers";
import { hazo_get_auth } from "../../lib/auth/hazo_get_auth.server";
import { create_firm } from "../../lib/services/firm_service";
import { user_has_any_scope } from "../../lib/services/user_scope_service";

// section: route_config
export const dynamic = "force-dynamic";

// section: api_handler
/**
 * POST - Create a new firm for the authenticated user
 * Body: { firm_name: string, org_structure: string }
 *
 * This endpoint is called when a new user verifies their email and has no
 * existing scope or invitation. They need to create their own firm.
 *
 * Validation:
 * - User must be authenticated
 * - User must not already have a scope assignment
 */
export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    // Authenticate user (no permission required - any authenticated user can create a firm)
    const auth = await hazo_get_auth(request);

    if (!auth.authenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firm_name, org_structure } = body;

    // Validate required fields
    if (!firm_name || !firm_name.trim()) {
      return NextResponse.json(
        { error: "firm_name is required" },
        { status: 400 }
      );
    }

    if (!org_structure || !org_structure.trim()) {
      return NextResponse.json(
        { error: "org_structure is required" },
        { status: 400 }
      );
    }

    // Validate firm_name length
    if (firm_name.length > 100) {
      return NextResponse.json(
        { error: "firm_name must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Validate org_structure length
    if (org_structure.length > 50) {
      return NextResponse.json(
        { error: "org_structure must be 50 characters or less" },
        { status: 400 }
      );
    }

    const hazoConnect = get_hazo_connect_instance();

    // Check if user already has a scope assignment
    const has_scope = await user_has_any_scope(hazoConnect, auth.user.id);
    if (has_scope) {
      return NextResponse.json(
        { error: "User already belongs to a firm" },
        { status: 400 }
      );
    }

    // Create the firm
    const result = await create_firm(hazoConnect, {
      firm_name: firm_name.trim(),
      org_structure: org_structure.trim(),
      user_id: auth.user.id,
    });

    if (!result.success) {
      logger.warn("create_firm_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        user_id: auth.user.id,
        error: result.error,
      });

      return NextResponse.json(
        { error: result.error || "Failed to create firm" },
        { status: 500 }
      );
    }

    logger.info("firm_created", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id: auth.user.id,
      scope_id: result.scope?.id,
      firm_name,
    });

    return NextResponse.json(
      {
        success: true,
        scope: result.scope,
        user_scope: result.user_scope,
        message: "Firm created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("create_firm_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Failed to create firm" },
      { status: 500 }
    );
  }
}
