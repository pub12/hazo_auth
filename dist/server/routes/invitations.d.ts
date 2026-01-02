import { NextRequest, NextResponse } from "next/server";
export declare const dynamic = "force-dynamic";
/**
 * GET - List invitations
 * Query params:
 *   - scope_id: Filter by scope (optional, required for non-super-admins)
 *   - status: Filter by status (optional: PENDING, ACCEPTED, EXPIRED, REVOKED)
 * Super admins can see all invitations, others can only see invitations for their scopes
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    invitations: unknown[];
}>>;
/**
 * POST - Create a new invitation
 * Body: { email_address, scope_id, role_id, expires_in_hours? }
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    invitation: import("../..").InvitationRecord | undefined;
}>>;
/**
 * PATCH - Update invitation (revoke)
 * Body: { invitation_id, action: "revoke" }
 */
export declare function PATCH(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    invitation: import("../..").InvitationRecord | undefined;
}>>;
/**
 * DELETE - Delete/revoke an invitation
 * Query params: invitation_id
 */
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
//# sourceMappingURL=invitations.d.ts.map