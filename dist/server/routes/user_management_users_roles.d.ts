import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
/**
 * GET - Get roles assigned to a user
 * v5.x: Returns unique role_ids from hazo_user_scopes (aggregated across all scopes)
 * Query params: user_id (string)
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    role_ids: string[];
}>>;
/**
 * POST - Assign a role to a user within a scope
 * v5.x: Roles are assigned per-scope via hazo_user_scopes
 * Body: { user_id: string, role_id: string, scope_id?: string }
 * If scope_id is not provided, uses DEFAULT_SYSTEM_SCOPE_ID
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    assignment: {
        user_id: string;
        role_id: string;
        scope_id: any;
    };
}>>;
/**
 * PUT - Update user roles (bulk assignment/removal)
 * v5.x: This updates roles across all of user's scope assignments.
 * For fine-grained control, use scope-specific endpoints.
 * Body: { user_id: string, role_ids: string[], scope_id?: string }
 * If scope_id is provided, only updates that scope. Otherwise updates default system scope.
 */
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    added: number;
    removed: number;
}>>;
//# sourceMappingURL=user_management_users_roles.d.ts.map