import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
/**
 * GET - Get roles assigned to a user
 * Query params: user_id (string)
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    role_ids: number[];
}>>;
/**
 * POST - Assign a role to a user
 * Body: { user_id: string, role_id: number }
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    assignment: {
        user_id: string;
        role_id: number;
    };
}>>;
/**
 * PUT - Update user roles (bulk assignment/removal)
 * Body: { user_id: string, role_ids: number[] }
 */
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    added: number;
    removed: number;
}>>;
//# sourceMappingURL=user_management_users_roles.d.ts.map