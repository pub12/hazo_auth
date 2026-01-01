// file_description: API route to get app_user_data schema configuration
// Returns the JSON schema and section labels for the app_user_data editor
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { hazo_get_auth } from "../../../../../lib/auth/hazo_get_auth.server";
import {
  get_app_user_data_config,
  get_section_label,
  get_field_label,
} from "../../../../../lib/app_user_data_config.server";

// section: route_config
export const dynamic = "force-dynamic";

// section: api_handler
/**
 * GET /api/hazo_auth/app_user_data/schema
 *
 * Returns the app_user_data schema configuration for rendering the editor.
 * Requires authentication.
 *
 * Response format (schema enabled):
 * {
 *   success: true,
 *   enabled: true,
 *   schema: { type: "object", properties: {...} },
 *   section_labels: { "electronic_funds_transfer": "Bank Account Details", ... }
 * }
 *
 * Response format (schema disabled):
 * {
 *   success: true,
 *   enabled: false,
 *   schema: null,
 *   section_labels: {}
 * }
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

    const config = get_app_user_data_config();

    // Convert Map to plain object for JSON response
    const section_labels: Record<string, string> = {};
    config.section_labels.forEach((value, key) => {
      section_labels[key] = value;
    });

    // If schema is enabled, also compute labels for each field
    const field_labels: Record<string, Record<string, string>> = {};
    if (config.enable_schema && config.schema) {
      for (const [section_key, section_prop] of Object.entries(config.schema.properties)) {
        if (section_prop.type === "object" && section_prop.properties) {
          field_labels[section_key] = {};
          for (const field_key of Object.keys(section_prop.properties)) {
            field_labels[section_key][field_key] = get_field_label(field_key, section_key);
          }
        }
      }

      // Add section labels for keys not explicitly defined
      for (const section_key of Object.keys(config.schema.properties)) {
        if (!section_labels[section_key]) {
          section_labels[section_key] = get_section_label(section_key);
        }
      }
    }

    return NextResponse.json({
      success: true,
      enabled: config.enable_schema && config.schema !== null,
      schema: config.schema,
      section_labels,
      field_labels,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: error_message }, { status: 500 });
  }
}
