import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
/**
 * GET - Fetch all permissions from database and config
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    db_permissions: {
        id: unknown;
        permission_name: unknown;
        description: {};
    }[];
    config_permissions: string[];
}>>;
/**
 * POST - Create new permission or migrate config permissions to database
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    created: string[];
    skipped: string[];
}> | NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    permission: {
        id: number;
        permission_name: string;
        description: any;
    };
}>>;
/**
 * PUT - Update permission description
 */
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
/**
 * DELETE - Delete permission from database
 */
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
//# sourceMappingURL=user_management_permissions.d.ts.map