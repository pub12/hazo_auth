import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
/**
 * GET - Fetch all users with details or a specific user by id
 * Query params: id (optional) - if provided, returns only that user
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    user_types_enabled: boolean;
    available_user_types: {
        key: string;
        label: string;
        badge_color: string;
    }[];
    users: {
        id: unknown;
        name: {} | null;
        email_address: unknown;
        email_verified: {};
        is_active: boolean;
        last_logon: {} | null;
        created_at: {} | null;
        profile_picture_url: {} | null;
        profile_source: {} | null;
        user_type: string | null;
        app_user_data: Record<string, unknown> | null;
    }[];
}>>;
/**
 * PATCH - Update user (deactivate: set status to 'inactive', etc.)
 */
export declare function PATCH(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
/**
 * POST - Send password reset email to user
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
//# sourceMappingURL=route.d.ts.map