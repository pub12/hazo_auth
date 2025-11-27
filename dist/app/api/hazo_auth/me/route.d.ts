import { NextRequest, NextResponse } from "next/server";
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
export declare function GET(request: NextRequest): Promise<NextResponse<{
    authenticated: boolean;
}>>;
//# sourceMappingURL=route.d.ts.map