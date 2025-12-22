// file_description: API route for user types configuration
// Returns the list of configured user types for UI dropdowns
import { NextRequest, NextResponse } from "next/server";
import {
  get_user_types_config,
  get_all_user_types,
} from "../../../../../lib/user_types_config.server";

export const dynamic = "force-dynamic";

/**
 * GET - Get user types configuration (for client-side UI)
 * Returns whether feature is enabled, default type, and list of available types
 */
export async function GET(request: NextRequest) {
  try {
    const config = get_user_types_config();

    return NextResponse.json({
      success: true,
      enabled: config.enable_user_types,
      default_type: config.default_user_type,
      types: get_all_user_types().map((type) => ({
        key: type.key,
        label: type.label,
        badge_color: type.badge_color,
      })),
    });
  } catch (error) {
    console.error("Error fetching user types config:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user types configuration",
      },
      { status: 500 }
    );
  }
}
