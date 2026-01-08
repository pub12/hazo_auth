import { NextRequest } from "next/server";
import type { TenantAuthOptions, TenantAuthResult, RequiredTenantAuthResult } from "./auth_types";
/**
 * Extracts scope ID from request headers or cookies
 * Priority: Header > Cookie
 * @param request - NextRequest object
 * @param options - TenantAuthOptions for customization
 * @returns Scope ID if found, undefined otherwise
 */
export declare function extract_scope_id_from_request(request: NextRequest, options: TenantAuthOptions): string | undefined;
/**
 * Tenant-aware authentication function
 *
 * Extracts tenant/scope context from request headers or cookies,
 * validates access, and returns enriched result with organization info.
 *
 * Header priority: X-Hazo-Scope-Id > Cookie
 *
 * @param request - NextRequest object
 * @param options - TenantAuthOptions for customization
 * @returns TenantAuthResult with user, permissions, organization, and user_scopes
 *
 * @example
 * ```typescript
 * const auth = await hazo_get_tenant_auth(request);
 * if (auth.authenticated && auth.organization) {
 *   // Access tenant-specific data
 *   const data = await getData(auth.organization.id);
 * }
 * ```
 */
export declare function hazo_get_tenant_auth(request: NextRequest, options?: TenantAuthOptions): Promise<TenantAuthResult>;
/**
 * Strict tenant authentication helper
 *
 * Wraps hazo_get_tenant_auth and throws appropriate errors:
 * - AuthenticationRequiredError (401) if not authenticated
 * - TenantRequiredError (403) if no tenant context in request
 * - TenantAccessDeniedError (403) if user lacks access to requested tenant
 *
 * @param request - NextRequest object
 * @param options - TenantAuthOptions for customization
 * @returns RequiredTenantAuthResult with guaranteed non-null organization
 * @throws AuthenticationRequiredError, TenantRequiredError, TenantAccessDeniedError
 *
 * @example
 * ```typescript
 * try {
 *   const auth = await require_tenant_auth(request);
 *   // auth.organization is guaranteed non-null here
 *   const data = await getData(auth.organization.id);
 * } catch (error) {
 *   if (error instanceof HazoAuthError) {
 *     return NextResponse.json(
 *       { error: error.message, code: error.code },
 *       { status: error.status_code }
 *     );
 *   }
 *   throw error;
 * }
 * ```
 */
export declare function require_tenant_auth(request: NextRequest, options?: TenantAuthOptions): Promise<RequiredTenantAuthResult>;
//# sourceMappingURL=hazo_get_tenant_auth.server.d.ts.map