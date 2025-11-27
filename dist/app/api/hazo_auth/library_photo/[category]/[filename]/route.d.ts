import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
export declare function GET(request: NextRequest, { params }: {
    params: {
        category: string;
        filename: string;
    };
}): Promise<NextResponse<unknown>>;
//# sourceMappingURL=route.d.ts.map