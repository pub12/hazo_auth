import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    category: string;
    photos: string[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
        has_more: boolean;
        total_pages: number;
    };
    source: "project" | "node_modules";
}> | NextResponse<{
    success: boolean;
    categories: string[];
    source: "project" | "node_modules" | null;
}> | NextResponse<{
    error: string;
}>>;
//# sourceMappingURL=route.d.ts.map