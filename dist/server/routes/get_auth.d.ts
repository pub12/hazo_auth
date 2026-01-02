import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
/**
 * POST - Get authentication status and permissions
 * Body: { required_permissions?: string[], strict?: boolean }
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<import("../..").HazoAuthResult>>;
//# sourceMappingURL=get_auth.d.ts.map