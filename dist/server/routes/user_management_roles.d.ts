import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
/**
 * GET - Fetch all roles with their permissions
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    roles: {
        role_id: unknown;
        role_name: unknown;
        permissions: string[];
    }[];
    permissions: {
        id: unknown;
        permission_name: unknown;
    }[];
}>>;
/**
 * POST - Create new role
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    role: {
        role_id: number;
        role_name: string;
    };
}>>;
/**
 * PUT - Update role permissions (save role-permission matrix)
 */
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
//# sourceMappingURL=user_management_roles.d.ts.map