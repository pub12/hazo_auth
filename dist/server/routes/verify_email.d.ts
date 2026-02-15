import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
    user_id: string | undefined;
    email: string | undefined;
    action: import("../../server-lib").PostVerificationAction;
    redirect_url: string | undefined;
    invitation_accepted: boolean | undefined;
}>>;
//# sourceMappingURL=verify_email.d.ts.map