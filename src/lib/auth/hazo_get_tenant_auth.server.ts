// file_description: tenant-aware authentication function that extracts scope from request headers/cookies
// section: imports
import { NextRequest } from "next/server";
import { hazo_get_auth } from "./hazo_get_auth.server";
import { get_auth_cache } from "./auth_cache";
import { get_scope_by_id } from "../services/scope_service";
import { get_hazo_connect_instance } from "../hazo_connect_instance.server";
import { get_cookie_name } from "../cookies_config.server";
import { get_auth_utility_config } from "../auth_utility_config.server";
import type {
  TenantAuthOptions,
  TenantAuthResult,
  RequiredTenantAuthResult,
  TenantOrganization,
  ScopeDetails,
} from "./auth_types";
import {
  AuthenticationRequiredError,
  TenantRequiredError,
  TenantAccessDeniedError,
} from "./auth_types";

// section: constants

/**
 * Default header name for scope ID
 */
const DEFAULT_SCOPE_HEADER = "X-Hazo-Scope-Id";

/**
 * Base cookie name for scope ID (will have prefix applied)
 */
const BASE_SCOPE_COOKIE = "hazo_auth_scope_id";

// section: helpers

/**
 * Extracts scope ID from request headers or cookies
 * Priority: Header > Cookie
 * @param request - NextRequest object
 * @param options - TenantAuthOptions for customization
 * @returns Scope ID if found, undefined otherwise
 */
export function extract_scope_id_from_request(
  request: NextRequest,
  options: TenantAuthOptions,
): string | undefined {
  // Check header first
  const header_name = options.scope_header_name || DEFAULT_SCOPE_HEADER;
  const header_value = request.headers.get(header_name);
  if (header_value) {
    return header_value;
  }

  // Check cookie (with prefix)
  const cookie_name = options.scope_cookie_name || get_cookie_name(BASE_SCOPE_COOKIE);
  const cookie_value = request.cookies.get(cookie_name)?.value;
  return cookie_value;
}

/**
 * Builds TenantOrganization from scope details and access info
 * @param scope_details - Full scope details from cache
 * @param is_super_admin - Whether user is accessing as super admin
 * @returns TenantOrganization object
 */
function build_tenant_organization(
  scope_details: ScopeDetails,
  is_super_admin: boolean,
): TenantOrganization {
  return {
    id: scope_details.id,
    name: scope_details.name,
    slug: scope_details.slug,
    level: scope_details.level,
    role_id: scope_details.role_id,
    is_super_admin,
    branding:
      scope_details.logo_url || scope_details.primary_color
        ? {
            logo_url: scope_details.logo_url,
            primary_color: scope_details.primary_color,
            secondary_color: scope_details.secondary_color,
            tagline: scope_details.tagline,
          }
        : undefined,
  };
}

// section: main_functions

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
export async function hazo_get_tenant_auth(
  request: NextRequest,
  options: TenantAuthOptions = {},
): Promise<TenantAuthResult> {
  // Extract scope_id from request
  const scope_id = extract_scope_id_from_request(request, options);

  // Build hazo_get_auth options, passing through scope_id if present
  const auth_options = {
    ...options,
    scope_id: scope_id || options.scope_id, // Allow explicit override via options
  };

  // Call base hazo_get_auth
  const auth_result = await hazo_get_auth(request, auth_options);

  // Handle unauthenticated case
  if (!auth_result.authenticated) {
    return {
      authenticated: false,
      user: null,
      permissions: [],
      permission_ok: false,
      organization: null,
      organization_id: null,
      user_scopes: [],
      scope_ok: false,
    };
  }

  // Get user's scopes from cache (already populated by hazo_get_auth)
  const config = get_auth_utility_config();
  const cache = get_auth_cache(
    config.cache_max_users,
    config.cache_ttl_minutes,
    config.cache_max_age_minutes,
  );
  const cached = cache.get(auth_result.user.id);

  // User scopes from cache or empty array
  const user_scopes: ScopeDetails[] = cached?.scopes || [];

  // Build organization info if scope access was successful
  let organization: TenantOrganization | null = null;

  if (scope_id && auth_result.scope_ok && auth_result.scope_access_via) {
    // Find the scope in user's scopes that matches the access_via scope
    const access_scope = user_scopes.find(
      (s) => s.id === auth_result.scope_access_via?.scope_id,
    );

    if (access_scope) {
      organization = build_tenant_organization(
        access_scope,
        auth_result.scope_access_via.is_super_admin || false,
      );
    } else if (auth_result.scope_access_via.is_super_admin) {
      // Super admin accessing scope they're not assigned to - fetch scope details
      const hazoConnect = get_hazo_connect_instance();
      const scope_result = await get_scope_by_id(hazoConnect, scope_id);
      if (scope_result.success && scope_result.scope) {
        organization = {
          id: scope_result.scope.id,
          name: scope_result.scope.name,
          slug: null, // Could fetch from scope if slug column exists
          level: scope_result.scope.level,
          role_id: "", // Super admin doesn't have a role in the scope
          is_super_admin: true,
          branding: scope_result.scope.logo_url
            ? {
                logo_url: scope_result.scope.logo_url,
                primary_color: scope_result.scope.primary_color,
                secondary_color: scope_result.scope.secondary_color,
                tagline: scope_result.scope.tagline,
              }
            : undefined,
        };
      }
    }
  }

  return {
    authenticated: true,
    user: auth_result.user,
    permissions: auth_result.permissions,
    permission_ok: auth_result.permission_ok,
    missing_permissions: auth_result.missing_permissions,
    organization,
    organization_id: organization?.id || null,
    user_scopes,
    scope_ok: auth_result.scope_ok,
    scope_access_via: auth_result.scope_access_via,
  };
}

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
export async function require_tenant_auth(
  request: NextRequest,
  options: TenantAuthOptions = {},
): Promise<RequiredTenantAuthResult> {
  const result = await hazo_get_tenant_auth(request, options);

  // Check authentication
  if (!result.authenticated) {
    throw new AuthenticationRequiredError();
  }

  // Extract scope_id from request for error messages
  const scope_id = extract_scope_id_from_request(request, options);

  // Check if scope was requested but access denied
  if (scope_id && !result.scope_ok) {
    throw new TenantAccessDeniedError(scope_id, result.user_scopes);
  }

  // Check if organization context is required but missing
  if (!result.organization) {
    throw new TenantRequiredError(
      "No organization context provided. Include X-Hazo-Scope-Id header or scope cookie.",
      result.user_scopes,
    );
  }

  // Type assertion: at this point we know organization is non-null
  return result as RequiredTenantAuthResult;
}
