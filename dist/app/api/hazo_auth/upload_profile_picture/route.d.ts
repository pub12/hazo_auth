import { NextRequest, NextResponse } from "next/server";
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    profile_picture_url: string;
    message: string;
}>>;
//# sourceMappingURL=route.d.ts.map