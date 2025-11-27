import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    category: string;
    photos: string[];
}> | NextResponse<{
    success: boolean;
    categories: string[];
}> | NextResponse<{
    error: string;
}>>;
//# sourceMappingURL=route.d.ts.map