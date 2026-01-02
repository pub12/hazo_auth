import { NextRequest, NextResponse } from "next/server";
/**
 * GET /api/hazo_auth/me
 *
 * Standardized endpoint that returns authenticated user information with permissions.
 * Always returns the same format to prevent downstream variations.
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    authenticated: boolean;
}>>;
//# sourceMappingURL=me.d.ts.map