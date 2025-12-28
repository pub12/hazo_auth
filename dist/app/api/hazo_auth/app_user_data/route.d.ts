import { NextRequest, NextResponse } from "next/server";
/**
 * GET /api/hazo_auth/app_user_data
 *
 * Returns the current app_user_data for the authenticated user.
 *
 * Response format:
 * { success: true, data: {...} | null }
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    data: Record<string, unknown> | null;
}>>;
/**
 * PATCH /api/hazo_auth/app_user_data
 *
 * Merges new data with existing app_user_data.
 *
 * Request body:
 * { data: {...} }
 *
 * Response format:
 * { success: true, data: {...} }
 */
export declare function PATCH(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    data: Record<string, unknown> | null;
}>>;
/**
 * PUT /api/hazo_auth/app_user_data
 *
 * Replaces existing app_user_data entirely with new data.
 *
 * Request body:
 * { data: {...} }
 *
 * Response format:
 * { success: true, data: {...} }
 */
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    data: Record<string, unknown> | null;
}>>;
/**
 * DELETE /api/hazo_auth/app_user_data
 *
 * Clears the app_user_data for the authenticated user (sets to null).
 *
 * Response format:
 * { success: true, data: null }
 */
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    data: null;
}>>;
//# sourceMappingURL=route.d.ts.map