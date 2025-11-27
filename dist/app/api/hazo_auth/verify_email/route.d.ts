import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
    user_id: string | undefined;
    email: string | undefined;
}>>;
//# sourceMappingURL=route.d.ts.map