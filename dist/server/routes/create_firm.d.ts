import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
/**
 * POST - Create a new firm for the authenticated user
 * Body: { firm_name: string, org_structure: string }
 *
 * This endpoint is called when a new user verifies their email and has no
 * existing scope or invitation. They need to create their own firm.
 *
 * Validation:
 * - User must be authenticated
 * - User must not already have a scope assignment
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    scope: import("../..").ScopeRecord | undefined;
    user_scope: import("../..").UserScope | undefined;
    message: string;
}>>;
//# sourceMappingURL=create_firm.d.ts.map