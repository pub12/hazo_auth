// file_description: withAuth/withOptionalAuth route handler wrappers that eliminate auth boilerplate
// section: server_only_guard
import "server-only";
// section: imports
import { NextResponse } from "next/server";
import { hazo_get_tenant_auth } from "./hazo_get_tenant_auth.server.js";
import { HazoAuthError, PermissionError, } from "./auth_types.js";
// section: error_response_helper
/**
 * Converts caught errors into appropriate NextResponse JSON responses
 */
function handle_auth_error(error) {
    if (error instanceof HazoAuthError) {
        return NextResponse.json({ error: error.message, code: error.code }, { status: error.status_code });
    }
    if (error instanceof PermissionError) {
        return NextResponse.json({
            error: error.message,
            code: "PERMISSION_DENIED",
            missing_permissions: error.missing_permissions,
        }, { status: 403 });
    }
    console.error("Unexpected error in route handler:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
/**
 * Resolves params from Next.js route context, handling missing context gracefully
 */
async function resolve_params(context) {
    if (!(context === null || context === void 0 ? void 0 : context.params)) {
        return {};
    }
    return await context.params;
}
export function withAuth(handler, options = {}) {
    return async (request, context) => {
        var _a;
        try {
            const auth = await hazo_get_tenant_auth(request, options);
            if (!auth.authenticated) {
                return NextResponse.json({ error: "Authentication required", code: "AUTHENTICATION_REQUIRED" }, { status: 401 });
            }
            // Check permissions if required_permissions were specified
            if (((_a = options.required_permissions) === null || _a === void 0 ? void 0 : _a.length) && !auth.permission_ok) {
                return NextResponse.json({
                    error: "Insufficient permissions",
                    code: "PERMISSION_DENIED",
                    missing_permissions: auth.missing_permissions,
                }, { status: 403 });
            }
            // Check tenant requirement
            if (options.require_tenant && !auth.organization) {
                return NextResponse.json({
                    error: "Organization context required",
                    code: "TENANT_REQUIRED",
                }, { status: 403 });
            }
            const params = await resolve_params(context);
            // Cast is safe: overloads ensure correct handler type matches options
            return await handler(request, auth, params);
        }
        catch (error) {
            return handle_auth_error(error);
        }
    };
}
// section: with_optional_auth
/**
 * Wraps a route handler with optional authentication and error handling.
 *
 * Always calls the handler regardless of auth state. The handler receives
 * the full TenantAuthResult which may be unauthenticated.
 *
 * @example
 * ```typescript
 * export const GET = withOptionalAuth(async (request, auth, params) => {
 *   if (auth.authenticated) {
 *     return NextResponse.json({ user: auth.user, data: getPrivateData() });
 *   }
 *   return NextResponse.json({ data: getPublicData() });
 * });
 * ```
 */
export function withOptionalAuth(handler, options = {}) {
    return async (request, context) => {
        try {
            const auth = await hazo_get_tenant_auth(request, options);
            const params = await resolve_params(context);
            return await handler(request, auth, params);
        }
        catch (error) {
            return handle_auth_error(error);
        }
    };
}
// section: permission_helpers
/**
 * Check if auth result has a specific permission
 */
export function hasPermission(auth, permission) {
    return auth.permissions.includes(permission);
}
/**
 * Check if auth result has all specified permissions
 */
export function hasAllPermissions(auth, permissions) {
    return permissions.every((p) => auth.permissions.includes(p));
}
/**
 * Check if auth result has any of the specified permissions
 */
export function hasAnyPermission(auth, permissions) {
    return permissions.some((p) => auth.permissions.includes(p));
}
/**
 * Throws PermissionError if auth result lacks the specified permission.
 * Caught by withAuth/withOptionalAuth wrappers and returned as 403.
 */
export function requirePermission(auth, permission) {
    if (!auth.permissions.includes(permission)) {
        throw new PermissionError([permission], auth.permissions, [permission]);
    }
}
/**
 * Throws PermissionError if auth result lacks any of the specified permissions.
 * Caught by withAuth/withOptionalAuth wrappers and returned as 403.
 */
export function requireAllPermissions(auth, permissions) {
    const missing = permissions.filter((p) => !auth.permissions.includes(p));
    if (missing.length > 0) {
        throw new PermissionError(missing, auth.permissions, permissions);
    }
}
