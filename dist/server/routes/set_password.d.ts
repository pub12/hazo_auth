import { NextRequest, NextResponse } from "next/server";
/**
 * POST /api/hazo_auth/set_password
 * Allows OAuth-only users (e.g., Google sign-in users) to set a password
 * This enables them to use email/password login in addition to OAuth
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
}>>;
//# sourceMappingURL=set_password.d.ts.map