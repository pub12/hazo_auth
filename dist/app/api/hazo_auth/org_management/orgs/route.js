// file_description: API route for organization management (list, create, update, soft delete)
// section: imports
import { NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../../../../lib/hazo_connect_instance.server";
import { hazo_get_auth } from "../../../../../lib/auth/hazo_get_auth.server";
import { create_app_logger } from "../../../../../lib/app_logger";
import { get_filename, get_line_number } from "../../../../../lib/utils/api_route_helpers";
import { is_multi_tenancy_enabled } from "../../../../../lib/multi_tenancy_config.server";
import { get_orgs, create_org, update_org, soft_delete_org, get_org_tree, check_user_org_access, } from "../../../../../lib/services/org_service";
// section: route_config
export const dynamic = "force-dynamic";
// section: constants
const PERMISSION_ORG_MANAGEMENT = "hazo_perm_org_management";
const PERMISSION_GLOBAL_ADMIN = "hazo_org_global_admin";
// section: helpers
async function check_permission(request) {
    const auth_result = await hazo_get_auth(request, {
        required_permissions: [PERMISSION_ORG_MANAGEMENT],
        strict: false,
    });
    if (!auth_result.authenticated) {
        return {
            authorized: false,
            error: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
        };
    }
    if (!auth_result.permission_ok) {
        return {
            authorized: false,
            error: NextResponse.json({ error: "Permission denied", missing_permissions: auth_result.missing_permissions }, { status: 403 }),
        };
    }
    // Check if user has global admin permission
    const is_global_admin = auth_result.permissions.includes(PERMISSION_GLOBAL_ADMIN);
    return {
        authorized: true,
        user_id: auth_result.user.id,
        user_org_id: auth_result.user.org_id || null,
        user_root_org_id: auth_result.user.root_org_id || null,
        is_global_admin,
    };
}
// section: api_handler
/**
 * GET - Fetch organizations
 * Query params:
 * - action: 'list' | 'tree' (default: 'list')
 * - include_inactive: boolean (default: false)
 * - root_org_id: string (optional, filter by root org - required unless global admin)
 */
export async function GET(request) {
    var _a;
    const logger = create_app_logger();
    try {
        // Check if multi-tenancy is enabled
        if (!is_multi_tenancy_enabled()) {
            return NextResponse.json({ error: "Multi-tenancy is not enabled", code: "MULTI_TENANCY_DISABLED" }, { status: 400 });
        }
        // Check permission
        const perm_check = await check_permission(request);
        if (!perm_check.authorized) {
            return perm_check.error;
        }
        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action") || "list";
        const include_inactive = searchParams.get("include_inactive") === "true";
        let root_org_id = searchParams.get("root_org_id") || undefined;
        const adapter = get_hazo_connect_instance();
        // If not global admin, restrict to user's org tree
        if (!perm_check.is_global_admin) {
            // User must have an org to view orgs
            if (!perm_check.user_root_org_id && !perm_check.user_org_id) {
                return NextResponse.json({ error: "You are not assigned to any organization" }, { status: 403 });
            }
            // Force filter to user's root org
            root_org_id = perm_check.user_root_org_id || perm_check.user_org_id || undefined;
        }
        if (action === "tree") {
            // Return hierarchical tree structure
            const result = await get_org_tree(adapter, root_org_id, include_inactive);
            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: 500 });
            }
            return NextResponse.json({
                success: true,
                tree: result.tree,
            });
        }
        // List organizations
        const result = await get_orgs(adapter, {
            root_org_id,
            include_inactive,
        });
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
        logger.info("org_management_orgs_fetched", {
            filename: get_filename(),
            line_number: get_line_number(),
            root_org_id,
            count: ((_a = result.orgs) === null || _a === void 0 ? void 0 : _a.length) || 0,
            is_global_admin: perm_check.is_global_admin,
        });
        return NextResponse.json({
            success: true,
            orgs: result.orgs,
        });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("org_management_orgs_fetch_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
        });
        return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
    }
}
/**
 * POST - Create a new organization
 * Body: { name: string, user_limit?: number, parent_org_id?: string }
 */
export async function POST(request) {
    var _a;
    const logger = create_app_logger();
    try {
        // Check if multi-tenancy is enabled
        if (!is_multi_tenancy_enabled()) {
            return NextResponse.json({ error: "Multi-tenancy is not enabled", code: "MULTI_TENANCY_DISABLED" }, { status: 400 });
        }
        // Check permission
        const perm_check = await check_permission(request);
        if (!perm_check.authorized) {
            return perm_check.error;
        }
        const body = await request.json();
        const { name, user_limit, parent_org_id } = body;
        // Validate required fields
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json({ error: "name is required and must be a non-empty string" }, { status: 400 });
        }
        const adapter = get_hazo_connect_instance();
        // If not global admin, verify user has access to parent org
        if (!perm_check.is_global_admin && parent_org_id) {
            const access_check = await check_user_org_access(adapter, perm_check.user_org_id || null, perm_check.user_root_org_id || null, parent_org_id);
            if (!access_check.has_access) {
                return NextResponse.json({ error: "You do not have access to the parent organization" }, { status: 403 });
            }
        }
        // If not global admin and no parent_org_id, they can't create root orgs
        if (!perm_check.is_global_admin && !parent_org_id) {
            return NextResponse.json({ error: "Only global admins can create root organizations" }, { status: 403 });
        }
        const result = await create_org(adapter, {
            name: name.trim(),
            user_limit: typeof user_limit === "number" ? user_limit : 0,
            parent_org_id,
            created_by: perm_check.user_id,
        });
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
        logger.info("org_management_org_created", {
            filename: get_filename(),
            line_number: get_line_number(),
            org_id: (_a = result.org) === null || _a === void 0 ? void 0 : _a.id,
            name: name.trim(),
            parent_org_id,
            created_by: perm_check.user_id,
        });
        return NextResponse.json({
            success: true,
            org: result.org,
        }, { status: 201 });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("org_management_org_create_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
        });
        return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }
}
/**
 * PATCH - Update an existing organization
 * Body: { org_id: string, name?: string, user_limit?: number }
 */
export async function PATCH(request) {
    const logger = create_app_logger();
    try {
        // Check if multi-tenancy is enabled
        if (!is_multi_tenancy_enabled()) {
            return NextResponse.json({ error: "Multi-tenancy is not enabled", code: "MULTI_TENANCY_DISABLED" }, { status: 400 });
        }
        // Check permission
        const perm_check = await check_permission(request);
        if (!perm_check.authorized) {
            return perm_check.error;
        }
        const body = await request.json();
        const { org_id, name, user_limit } = body;
        // Validate required fields
        if (!org_id || typeof org_id !== "string") {
            return NextResponse.json({ error: "org_id is required" }, { status: 400 });
        }
        const adapter = get_hazo_connect_instance();
        // If not global admin, verify user has access to this org
        if (!perm_check.is_global_admin) {
            const access_check = await check_user_org_access(adapter, perm_check.user_org_id || null, perm_check.user_root_org_id || null, org_id);
            if (!access_check.has_access) {
                return NextResponse.json({ error: "You do not have access to this organization" }, { status: 403 });
            }
        }
        // Build update data
        const update_data = {
            changed_by: perm_check.user_id,
        };
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim().length === 0) {
                return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
            }
            update_data.name = name.trim();
        }
        if (user_limit !== undefined) {
            if (typeof user_limit !== "number" || user_limit < 0) {
                return NextResponse.json({ error: "user_limit must be a non-negative number" }, { status: 400 });
            }
            update_data.user_limit = user_limit;
        }
        if (update_data.name === undefined && update_data.user_limit === undefined) {
            return NextResponse.json({ error: "No update data provided" }, { status: 400 });
        }
        const result = await update_org(adapter, org_id, update_data);
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
        logger.info("org_management_org_updated", {
            filename: get_filename(),
            line_number: get_line_number(),
            org_id,
            changed_by: perm_check.user_id,
        });
        return NextResponse.json({
            success: true,
            org: result.org,
        });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("org_management_org_update_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
        });
        return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
    }
}
/**
 * DELETE - Soft delete an organization (sets active = false)
 * Query params: org_id
 */
export async function DELETE(request) {
    const logger = create_app_logger();
    try {
        // Check if multi-tenancy is enabled
        if (!is_multi_tenancy_enabled()) {
            return NextResponse.json({ error: "Multi-tenancy is not enabled", code: "MULTI_TENANCY_DISABLED" }, { status: 400 });
        }
        // Check permission
        const perm_check = await check_permission(request);
        if (!perm_check.authorized) {
            return perm_check.error;
        }
        const { searchParams } = new URL(request.url);
        const org_id = searchParams.get("org_id");
        if (!org_id) {
            return NextResponse.json({ error: "org_id query parameter is required" }, { status: 400 });
        }
        const adapter = get_hazo_connect_instance();
        // If not global admin, verify user has access to this org
        if (!perm_check.is_global_admin) {
            const access_check = await check_user_org_access(adapter, perm_check.user_org_id || null, perm_check.user_root_org_id || null, org_id);
            if (!access_check.has_access) {
                return NextResponse.json({ error: "You do not have access to this organization" }, { status: 403 });
            }
        }
        // Soft delete (set active = false)
        const result = await soft_delete_org(adapter, org_id, perm_check.user_id);
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
        logger.info("org_management_org_deactivated", {
            filename: get_filename(),
            line_number: get_line_number(),
            org_id,
            deactivated_by: perm_check.user_id,
        });
        return NextResponse.json({
            success: true,
            org: result.org,
            message: "Organization deactivated successfully",
        });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("org_management_org_deactivate_error", {
            filename: get_filename(),
            line_number: get_line_number(),
            error_message,
        });
        return NextResponse.json({ error: "Failed to deactivate organization" }, { status: 500 });
    }
}
