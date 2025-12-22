import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
/**
 * GET - Fetch organizations
 * Query params:
 * - action: 'list' | 'tree' (default: 'list')
 * - include_inactive: boolean (default: false)
 * - root_org_id: string (optional, filter by root org - required unless global admin)
 */
export declare function GET(request: NextRequest): Promise<NextResponse<unknown>>;
/**
 * POST - Create a new organization
 * Body: { name: string, user_limit?: number, parent_org_id?: string }
 */
export declare function POST(request: NextRequest): Promise<NextResponse<unknown>>;
/**
 * PATCH - Update an existing organization
 * Body: { org_id: string, name?: string, user_limit?: number }
 */
export declare function PATCH(request: NextRequest): Promise<NextResponse<unknown>>;
/**
 * DELETE - Soft delete an organization (sets active = false)
 * Query params: org_id
 */
export declare function DELETE(request: NextRequest): Promise<NextResponse<unknown>>;
//# sourceMappingURL=route.d.ts.map