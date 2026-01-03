import { NextRequest, NextResponse } from "next/server";
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
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    enabled: boolean;
    schema: import("../../lib/app_user_data_config.server").AppUserDataSchema | null;
    section_labels: Record<string, string>;
    field_labels: Record<string, Record<string, string>>;
}>>;
//# sourceMappingURL=app_user_data_schema.d.ts.map