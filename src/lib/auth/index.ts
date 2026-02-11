// file_description: barrel export for auth utilities
// section: type_exports
export * from "./auth_types";

// section: server_exports
export { hazo_get_auth } from "./hazo_get_auth.server";
export {
  get_authenticated_user,
  require_auth,
  is_authenticated,
} from "./auth_utils.server";
export type { AuthResult, AuthUser } from "./auth_utils.server";

// section: tenant_auth_exports
export {
  hazo_get_tenant_auth,
  require_tenant_auth,
  extract_scope_id_from_request,
} from "./hazo_get_tenant_auth.server";
export type {
  ScopeDetails,
  TenantOrganization,
  TenantAuthOptions,
  TenantAuthResult,
  RequiredTenantAuthResult,
} from "./auth_types";
export {
  HazoAuthError,
  AuthenticationRequiredError,
  TenantRequiredError,
  TenantAccessDeniedError,
} from "./auth_types";

// section: client_exports
export { get_server_auth_user } from "./server_auth";
export type { ServerAuthResult } from "./server_auth";

// section: with_auth_exports
export {
  withAuth,
  withOptionalAuth,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  requirePermission,
  requireAllPermissions,
} from "./with_auth.server";
export type {
  AuthenticatedTenantAuth,
  AuthenticatedTenantAuthWithOrg,
  WithAuthOptions,
} from "./with_auth.server";

// section: cache_exports
export { get_auth_cache, reset_auth_cache } from "./auth_cache";

// section: rate_limiter_exports
export { get_rate_limiter, reset_rate_limiter } from "./auth_rate_limiter";

