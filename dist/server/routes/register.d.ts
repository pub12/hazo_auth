import { NextRequest, NextResponse } from "next/server";
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
    user_id: string | undefined;
}>>;
//# sourceMappingURL=register.d.ts.map