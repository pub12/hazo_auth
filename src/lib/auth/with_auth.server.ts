// file_description: withAuth/withOptionalAuth route handler wrappers that eliminate auth boilerplate
// section: server_only_guard
import "server-only";

// section: imports
import { NextRequest, NextResponse } from "next/server";
import { hazo_get_tenant_auth } from "./hazo_get_tenant_auth.server";
import {
  HazoAuthError,
  PermissionError,
  type TenantAuthOptions,
  type TenantAuthResult,
  type TenantOrganization,
  type HazoAuthUser,
  type ScopeDetails,
  type ScopeAccessInfo,
} from "./auth_types";

// section: types

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
type AuthenticatedHandler<TParams> = (
  request: NextRequest,
  auth: AuthenticatedTenantAuth,
  params: TParams,
) => Promise<NextResponse> | NextResponse;

/**
 * Handler function signature for withAuth with require_tenant
 */
type AuthenticatedTenantHandler<TParams> = (
  request: NextRequest,
  auth: AuthenticatedTenantAuthWithOrg,
  params: TParams,
) => Promise<NextResponse> | NextResponse;

/**
 * Handler function signature for withOptionalAuth
 */
type OptionalAuthHandler<TParams> = (
  request: NextRequest,
  auth: TenantAuthResult,
  params: TParams,
) => Promise<NextResponse> | NextResponse;

// section: error_response_helper

/**
 * Converts caught errors into appropriate NextResponse JSON responses
 */
function handle_auth_error(error: unknown): NextResponse {
  if (error instanceof HazoAuthError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status_code },
    );
  }

  if (error instanceof PermissionError) {
    return NextResponse.json(
      {
        error: error.message,
        code: "PERMISSION_DENIED",
        missing_permissions: error.missing_permissions,
      },
      { status: 403 },
    );
  }

  console.error("Unexpected error in route handler:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}

/**
 * Resolves params from Next.js route context, handling missing context gracefully
 */
async function resolve_params<TParams>(
  context: RouteContext<TParams> | undefined,
): Promise<TParams> {
  if (!context?.params) {
    return {} as TParams;
  }
  return await context.params;
}

// section: with_auth

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
export function withAuth<TParams = Record<string, never>>(
  handler: AuthenticatedTenantHandler<TParams>,
  options: WithAuthOptions & { require_tenant: true },
): (
  request: NextRequest,
  context?: RouteContext<TParams>,
) => Promise<NextResponse>;

export function withAuth<TParams = Record<string, never>>(
  handler: AuthenticatedHandler<TParams>,
  options?: WithAuthOptions,
): (
  request: NextRequest,
  context?: RouteContext<TParams>,
) => Promise<NextResponse>;

export function withAuth<TParams = Record<string, never>>(
  handler:
    | AuthenticatedHandler<TParams>
    | AuthenticatedTenantHandler<TParams>,
  options: WithAuthOptions = {},
): (
  request: NextRequest,
  context?: RouteContext<TParams>,
) => Promise<NextResponse> {
  return async (
    request: NextRequest,
    context?: RouteContext<TParams>,
  ): Promise<NextResponse> => {
    try {
      const auth = await hazo_get_tenant_auth(request, options);

      if (!auth.authenticated) {
        return NextResponse.json(
          { error: "Authentication required", code: "AUTHENTICATION_REQUIRED" },
          { status: 401 },
        );
      }

      // Check permissions if required_permissions were specified
      if (options.required_permissions?.length && !auth.permission_ok) {
        return NextResponse.json(
          {
            error: "Insufficient permissions",
            code: "PERMISSION_DENIED",
            missing_permissions: auth.missing_permissions,
          },
          { status: 403 },
        );
      }

      // Check tenant requirement
      if (options.require_tenant && !auth.organization) {
        return NextResponse.json(
          {
            error: "Organization context required",
            code: "TENANT_REQUIRED",
          },
          { status: 403 },
        );
      }

      const params = await resolve_params(context);

      // Cast is safe: overloads ensure correct handler type matches options
      return await (handler as AuthenticatedHandler<TParams>)(
        request,
        auth as AuthenticatedTenantAuth,
        params,
      );
    } catch (error) {
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
export function withOptionalAuth<TParams = Record<string, never>>(
  handler: OptionalAuthHandler<TParams>,
  options: TenantAuthOptions = {},
): (
  request: NextRequest,
  context?: RouteContext<TParams>,
) => Promise<NextResponse> {
  return async (
    request: NextRequest,
    context?: RouteContext<TParams>,
  ): Promise<NextResponse> => {
    try {
      const auth = await hazo_get_tenant_auth(request, options);
      const params = await resolve_params(context);
      return await handler(request, auth, params);
    } catch (error) {
      return handle_auth_error(error);
    }
  };
}

// section: permission_helpers

/**
 * Check if auth result has a specific permission
 */
export function hasPermission(
  auth: AuthenticatedTenantAuth,
  permission: string,
): boolean {
  return auth.permissions.includes(permission);
}

/**
 * Check if auth result has all specified permissions
 */
export function hasAllPermissions(
  auth: AuthenticatedTenantAuth,
  permissions: string[],
): boolean {
  return permissions.every((p) => auth.permissions.includes(p));
}

/**
 * Check if auth result has any of the specified permissions
 */
export function hasAnyPermission(
  auth: AuthenticatedTenantAuth,
  permissions: string[],
): boolean {
  return permissions.some((p) => auth.permissions.includes(p));
}

/**
 * Throws PermissionError if auth result lacks the specified permission.
 * Caught by withAuth/withOptionalAuth wrappers and returned as 403.
 */
export function requirePermission(
  auth: AuthenticatedTenantAuth,
  permission: string,
): void {
  if (!auth.permissions.includes(permission)) {
    throw new PermissionError(
      [permission],
      auth.permissions,
      [permission],
    );
  }
}

/**
 * Throws PermissionError if auth result lacks any of the specified permissions.
 * Caught by withAuth/withOptionalAuth wrappers and returned as 403.
 */
export function requireAllPermissions(
  auth: AuthenticatedTenantAuth,
  permissions: string[],
): void {
  const missing = permissions.filter((p) => !auth.permissions.includes(p));
  if (missing.length > 0) {
    throw new PermissionError(
      missing,
      auth.permissions,
      permissions,
    );
  }
}
