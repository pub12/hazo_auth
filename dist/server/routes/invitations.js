// file_description: API route handler for invitation management (create, list, revoke)
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../lib/hazo_connect_instance.server";
import { create_app_logger } from "../../lib/app_logger";
import { get_filename, get_line_number } from "../../lib/utils/api_route_helpers";
import { hazo_get_auth } from "../../lib/auth/hazo_get_auth.server";
import { create_invitation, list_invitations_by_scope, list_all_invitations, revoke_invitation, get_invitation_by_id, } from "../../lib/services/invitation_service";
import { is_user_super_admin, get_user_scopes, } from "../../lib/services/user_scope_service";
// section: route_config
export const dynamic = "force-dynamic";
// section: api_handler
/**
 * GET - List invitations
 * Query params:
 *   - scope_id: Filter by scope (optional, required for non-super-admins)
 *   - status: Filter by status (optional: PENDING, ACCEPTED, EXPIRED, REVOKED)
 * Super admins can see all invitations, others can only see invitations for their scopes
 */
export async function GET(request) {
    var _a, _b;
    const logger = create_app_logger();
    try {
        // Authenticate user
        const auth = await hazo_get_auth(request, {
            required_permissions: ["admin_user_scope_assignment"],
            strict: false,
        });
        if (!auth.authenticated || !auth.permission_ok) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const scope_id = searchParams.get("scope_id");
        const status_param = searchParams.get("status");
        const status = status_param;
        const hazoConnect = get_hazo_connect_instance();
        // Check if user is super admin
        const is_super = await is_user_super_admin(hazoConnect, auth.user.id);
        let result;
        if (is_super) {
            // Super admin can see all invitations
            if (scope_id) {
                result = await list_invitations_by_scope(hazoConnect, scope_id, status);
            }
            else {
                result = await list_all_invitations(hazoConnect, status);
            }
        }
        else {
            // Non-super admin must specify a scope they have access to
            if (!scope_id) {
                // Get user's scopes and return invitations for all of them
                const user_scopes = await get_user_scopes(hazoConnect, auth.user.id);
                if (!user_scopes.success || !user_scopes.scopes) {
                    return NextResponse.json({ success: true, invitations: [] }, { status: 200 });
                }
                // Aggregate invitations from all user's scopes
                const all_invitations = [];
                for (const scope of user_scopes.scopes) {
                    const scope_result = await list_invitations_by_scope(hazoConnect, scope.scope_id, status);
                    if (scope_result.success && scope_result.invitations) {
                        all_invitations.push(...scope_result.invitations);
                    }
                }
                return NextResponse.json({ success: true, invitations: all_invitations }, { status: 200 });
            }
            // Verify user has access to this scope
            const user_scopes = await get_user_scopes(hazoConnect, auth.user.id);
            const has_scope_access = (_a = user_scopes.scopes) === null || _a === void 0 ? void 0 : _a.some((s) => s.scope_id === scope_id);
            if (!has_scope_access) {
                return NextResponse.json({ error: "Access denied to this scope" }, { status: 403 });
            }
            result = await list_invitations_by_scope(hazoConnect, scope_id, status);
        }
        if (!result.success) {
            return NextResponse.json({ error: result.error || "Failed to fetch invitations" }, { status: 500 });
        }
        logger.info("invitations_list_fetched", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id: auth.user.id,
            scope_id,
            count: ((_b = result.invitations) === null || _b === void 0 ? void 0 : _b.length) || 0,
        });
        return NextResponse.json({ success: true, invitations: result.invitations || [] }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("invitations_list_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
    }
}
/**
 * POST - Create a new invitation
 * Body: { email_address, scope_id, role_id, expires_in_hours? }
 */
export async function POST(request) {
    var _a, _b;
    const logger = create_app_logger();
    try {
        // Authenticate user
        const auth = await hazo_get_auth(request, {
            required_permissions: ["admin_user_scope_assignment"],
            strict: false,
        });
        if (!auth.authenticated || !auth.permission_ok) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await request.json();
        const { email_address, scope_id, role_id, expires_in_hours } = body;
        // Validate required fields
        if (!email_address || !scope_id || !role_id) {
            return NextResponse.json({ error: "email_address, scope_id, and role_id are required" }, { status: 400 });
        }
        // Validate email format
        const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email_regex.test(email_address)) {
            return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
        }
        const hazoConnect = get_hazo_connect_instance();
        // Check if user is super admin or has access to the scope
        const is_super = await is_user_super_admin(hazoConnect, auth.user.id);
        if (!is_super) {
            const user_scopes = await get_user_scopes(hazoConnect, auth.user.id);
            const has_scope_access = (_a = user_scopes.scopes) === null || _a === void 0 ? void 0 : _a.some((s) => s.scope_id === scope_id);
            if (!has_scope_access) {
                return NextResponse.json({ error: "Access denied to this scope" }, { status: 403 });
            }
        }
        // Create invitation
        const result = await create_invitation(hazoConnect, {
            email_address,
            scope_id,
            role_id,
            invited_by: auth.user.id,
            expires_in_hours,
        });
        if (!result.success) {
            return NextResponse.json({ error: result.error || "Failed to create invitation" }, { status: 400 });
        }
        logger.info("invitation_created", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id: auth.user.id,
            invitation_id: (_b = result.invitation) === null || _b === void 0 ? void 0 : _b.id,
            email_address,
            scope_id,
        });
        return NextResponse.json({ success: true, invitation: result.invitation }, { status: 201 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("invitation_create_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
    }
}
/**
 * PATCH - Update invitation (revoke)
 * Body: { invitation_id, action: "revoke" }
 */
export async function PATCH(request) {
    var _a;
    const logger = create_app_logger();
    try {
        // Authenticate user
        const auth = await hazo_get_auth(request, {
            required_permissions: ["admin_user_scope_assignment"],
            strict: false,
        });
        if (!auth.authenticated || !auth.permission_ok) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await request.json();
        const { invitation_id, action } = body;
        if (!invitation_id) {
            return NextResponse.json({ error: "invitation_id is required" }, { status: 400 });
        }
        if (action !== "revoke") {
            return NextResponse.json({ error: "Invalid action. Supported: revoke" }, { status: 400 });
        }
        const hazoConnect = get_hazo_connect_instance();
        // Get invitation to check scope access
        const invitation_result = await get_invitation_by_id(hazoConnect, invitation_id);
        if (!invitation_result.success || !invitation_result.invitation) {
            return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
        }
        // Check if user is super admin or has access to the invitation's scope
        const is_super = await is_user_super_admin(hazoConnect, auth.user.id);
        if (!is_super) {
            const user_scopes = await get_user_scopes(hazoConnect, auth.user.id);
            const has_scope_access = (_a = user_scopes.scopes) === null || _a === void 0 ? void 0 : _a.some((s) => { var _a; return s.scope_id === ((_a = invitation_result.invitation) === null || _a === void 0 ? void 0 : _a.scope_id); });
            if (!has_scope_access) {
                return NextResponse.json({ error: "Access denied to this invitation" }, { status: 403 });
            }
        }
        // Revoke invitation
        const result = await revoke_invitation(hazoConnect, invitation_id);
        if (!result.success) {
            return NextResponse.json({ error: result.error || "Failed to revoke invitation" }, { status: 400 });
        }
        logger.info("invitation_revoked", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id: auth.user.id,
            invitation_id,
        });
        return NextResponse.json({ success: true, invitation: result.invitation }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("invitation_revoke_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to revoke invitation" }, { status: 500 });
    }
}
/**
 * DELETE - Delete/revoke an invitation
 * Query params: invitation_id
 */
export async function DELETE(request) {
    var _a;
    const logger = create_app_logger();
    try {
        // Authenticate user
        const auth = await hazo_get_auth(request, {
            required_permissions: ["admin_user_scope_assignment"],
            strict: false,
        });
        if (!auth.authenticated || !auth.permission_ok) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const invitation_id = searchParams.get("invitation_id");
        if (!invitation_id) {
            return NextResponse.json({ error: "invitation_id is required" }, { status: 400 });
        }
        const hazoConnect = get_hazo_connect_instance();
        // Get invitation to check scope access
        const invitation_result = await get_invitation_by_id(hazoConnect, invitation_id);
        if (!invitation_result.success || !invitation_result.invitation) {
            return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
        }
        // Check if user is super admin or has access to the invitation's scope
        const is_super = await is_user_super_admin(hazoConnect, auth.user.id);
        if (!is_super) {
            const user_scopes = await get_user_scopes(hazoConnect, auth.user.id);
            const has_scope_access = (_a = user_scopes.scopes) === null || _a === void 0 ? void 0 : _a.some((s) => { var _a; return s.scope_id === ((_a = invitation_result.invitation) === null || _a === void 0 ? void 0 : _a.scope_id); });
            if (!has_scope_access) {
                return NextResponse.json({ error: "Access denied to this invitation" }, { status: 403 });
            }
        }
        // Revoke invitation (we don't actually delete, just change status)
        const result = await revoke_invitation(hazoConnect, invitation_id);
        if (!result.success) {
            return NextResponse.json({ error: result.error || "Failed to delete invitation" }, { status: 400 });
        }
        logger.info("invitation_deleted", {
            filename: get_filename(),
            line_number: get_line_number(),
            user_id: auth.user.id,
            invitation_id,
        });
        return NextResponse.json({ success: true }, { status: 200 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        logger.error("invitation_delete_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
            error_stack,
        });
        return NextResponse.json({ error: "Failed to delete invitation" }, { status: 500 });
    }
}
