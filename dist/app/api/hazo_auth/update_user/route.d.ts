import { NextRequest, NextResponse } from "next/server";
export declare function PATCH(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
    email_changed: boolean | undefined;
}>>;
//# sourceMappingURL=route.d.ts.map