import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
/**
 * POST - Manually invalidate auth cache
 * Body: { user_id?: string, role_ids?: number[], invalidate_all?: boolean }
 * Requires admin permission (checked via hazo_get_auth)
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
}>>;
//# sourceMappingURL=route.d.ts.map