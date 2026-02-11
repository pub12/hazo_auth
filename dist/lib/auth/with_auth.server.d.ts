import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { type TenantAuthOptions, type TenantAuthResult, type TenantOrganization, type HazoAuthUser, type ScopeDetails, type ScopeAccessInfo } from "./auth_types.js";
/**
 * Authenticated branch of TenantAuthResult - guaranteed authenticated: true
 */
export type AuthenticatedTenantAuth = {
    authenticated: true;
    user: HazoAuthUser;
    permissions: string[];
    permission_ok: boolean;
    missing_permissions?: string[];
    organization: TenantOrganization | null;
    organization_id: string | null;
    user_scopes: ScopeDetails[];
    scope_ok?: boolean;
    scope_access_via?: ScopeAccessInfo;
};
/**
 * Authenticated branch with guaranteed non-null organization
 */
export type AuthenticatedTenantAuthWithOrg = AuthenticatedTenantAuth & {
    organization: TenantOrganization;
    organization_id: string;
};
/**
 * Options for withAuth/withOptionalAuth wrappers
 * Extends TenantAuthOptions with require_tenant flag
 */
export type WithAuthOptions = TenantAuthOptions & {
    /**
     * If true, requires organization context (403 if missing)
     * Narrows auth type to AuthenticatedTenantAuthWithOrg
     */
    require_tenant?: boolean;
};
/**
 * Next.js route handler context with params Promise (Next.js 15 pattern)
 */
type RouteContext<TParams> = {
    params: Promise<TParams>;
};
/**
 * Handler function signature for withAuth
 */
type AuthenticatedHandler<TParams> = (request: NextRequest, auth: AuthenticatedTenantAuth, params: TParams) => Promise<NextResponse> | NextResponse;
/**
 * Handler function signature for withAuth with require_tenant
 */
type AuthenticatedTenantHandler<TParams> = (request: NextRequest, auth: AuthenticatedTenantAuthWithOrg, params: TParams) => Promise<NextResponse> | NextResponse;
/**
 * Handler function signature for withOptionalAuth
 */
type OptionalAuthHandler<TParams> = (request: NextRequest, auth: TenantAuthResult, params: TParams) => Promise<NextResponse> | NextResponse;
/**
 * Wraps a route handler with authentication, param resolution, and error handling.
 *
 * - Calls `hazo_get_tenant_auth` and returns 401 if not authenticated
 * - Returns 403 if `required_permissions` are specified and not satisfied
 * - Returns 403 if `require_tenant: true` and no organization context
 * - Resolves `await context.params` (Next.js 15 pattern)
 * - Catches HazoAuthError, PermissionError, and unexpected errors
 *
 * @example
 * ```typescript
 * // Simple authenticated route
 * export const GET = withAuth(async (request, auth, params) => {
 *   return NextResponse.json({ user: auth.user });
 * });
 *
 * // With permissions
 * export const DELETE = withAuth<{ id: string }>(
 *   async (request, auth, { id }) => {
 *     await deleteItem(id);
 *     return NextResponse.json({ success: true });
 *   },
 *   { required_permissions: ["admin_system"] }
 * );
 *
 * // With tenant requirement
 * export const GET = withAuth<{ id: string }>(
 *   async (request, auth, { id }) => {
 *     // auth.organization is guaranteed non-null
 *     const data = await getData(auth.organization.id, id);
 *     return NextResponse.json(data);
 *   },
 *   { require_tenant: true }
 * );
 * ```
 */
export declare function withAuth<TParams = Record<string, never>>(handler: AuthenticatedTenantHandler<TParams>, options: WithAuthOptions & {
    require_tenant: true;
}): (request: NextRequest, context?: RouteContext<TParams>) => Promise<NextResponse>;
export declare function withAuth<TParams = Record<string, never>>(handler: AuthenticatedHandler<TParams>, options?: WithAuthOptions): (request: NextRequest, context?: RouteContext<TParams>) => Promise<NextResponse>;
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
export declare function withOptionalAuth<TParams = Record<string, never>>(handler: OptionalAuthHandler<TParams>, options?: TenantAuthOptions): (request: NextRequest, context?: RouteContext<TParams>) => Promise<NextResponse>;
/**
 * Check if auth result has a specific permission
 */
export declare function hasPermission(auth: AuthenticatedTenantAuth, permission: string): boolean;
/**
 * Check if auth result has all specified permissions
 */
export declare function hasAllPermissions(auth: AuthenticatedTenantAuth, permissions: string[]): boolean;
/**
 * Check if auth result has any of the specified permissions
 */
export declare function hasAnyPermission(auth: AuthenticatedTenantAuth, permissions: string[]): boolean;
/**
 * Throws PermissionError if auth result lacks the specified permission.
 * Caught by withAuth/withOptionalAuth wrappers and returned as 403.
 */
export declare function requirePermission(auth: AuthenticatedTenantAuth, permission: string): void;
/**
 * Throws PermissionError if auth result lacks any of the specified permissions.
 * Caught by withAuth/withOptionalAuth wrappers and returned as 403.
 */
export declare function requireAllPermissions(auth: AuthenticatedTenantAuth, permissions: string[]): void;
export {};
//# sourceMappingURL=with_auth.server.d.ts.map