// file_description: Type definitions and error classes for hazo_get_auth utility
// section: types

/**
 * User data structure returned by hazo_get_auth
 */
export type HazoAuthUser = {
  id: string;
  name: string | null;
  email_address: string;
  is_active: boolean; // Derived from status column: status === 'ACTIVE'
  profile_picture_url: string | null;
  // App-specific user data (JSON object stored as TEXT in database)
  app_user_data: Record<string, unknown> | null;
};

/**
 * Scope access information returned when scope checking is used
 */
export type ScopeAccessInfo = {
  scope_id: string;
  scope_name?: string;
  is_super_admin?: boolean;
};

/**
 * Result type for hazo_get_auth function
 * Returns authenticated state with user data and permissions, or unauthenticated state
 * Optionally includes scope access information when scope checking is used
 */
export type HazoAuthResult =
  | {
      authenticated: true;
      user: HazoAuthUser;
      permissions: string[];
      permission_ok: boolean;
      missing_permissions?: string[];
      // Scope access fields (only present when scope options are provided)
      scope_ok?: boolean;
      scope_access_via?: ScopeAccessInfo;
    }
  | {
      authenticated: false;
      user: null;
      permissions: [];
      permission_ok: false;
      scope_ok?: false;
    };

/**
 * Options for hazo_get_auth function
 */
export type HazoAuthOptions = {
  /**
   * Array of required permissions to check
   * If provided, permission_ok will be set based on whether user has all required permissions
   */
  required_permissions?: string[];
  /**
   * If true, throws PermissionError when user lacks required permissions
   * If false (default), returns permission_ok: false without throwing
   */
  strict?: boolean;
  // Scope access checking options
  /**
   * The scope ID (UUID) to check access for
   * If provided, enables scope access checking
   */
  scope_id?: string;
};

/**
 * Custom error class for permission denials
 * Includes technical and user-friendly error messages
 * Optionally includes permission descriptions for debugging
 */
export class PermissionError extends Error {
  constructor(
    public missing_permissions: string[],
    public user_permissions: string[],
    public required_permissions: string[],
    public user_friendly_message?: string,
    public permission_descriptions?: Map<string, string>,
  ) {
    super(`Missing permissions: ${missing_permissions.join(", ")}`);
    this.name = "PermissionError";
  }
}

/**
 * Custom error class for scope access denials
 * Thrown when strict mode is enabled and user lacks access to required scope
 */
export class ScopeAccessError extends Error {
  constructor(
    public scope_id: string,
    public user_scopes: Array<{ scope_id: string; scope_name?: string }>,
  ) {
    super(`Access denied to scope: ${scope_id}`);
    this.name = "ScopeAccessError";
  }
}

// section: scope_details_types

/**
 * Full scope details with branding information
 * Used in cache and tenant auth results for multi-tenancy support
 */
export type ScopeDetails = {
  id: string;
  name: string;
  slug: string | null;
  level: string;
  parent_id: string | null;
  role_id: string;
  // Branding fields (from hazo_scopes table)
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  tagline: string | null;
};

/**
 * Tenant/organization information returned in tenant auth results
 * Simplified view of scope for API responses
 */
export type TenantOrganization = {
  id: string;
  name: string;
  slug: string | null;
  level: string;
  role_id: string;
  is_super_admin: boolean;
  branding?: {
    logo_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    tagline: string | null;
  };
};

/**
 * Options for hazo_get_tenant_auth function
 * Extends HazoAuthOptions with tenant-specific configuration
 */
export type TenantAuthOptions = HazoAuthOptions & {
  /**
   * Header name to check for scope ID (default: "X-Hazo-Scope-Id")
   */
  scope_header_name?: string;
  /**
   * Cookie name to check for scope ID (uses cookie prefix if not specified)
   */
  scope_cookie_name?: string;
};

/**
 * Result type for hazo_get_tenant_auth function
 * Extends HazoAuthResult with tenant-specific information
 */
export type TenantAuthResult =
  | {
      authenticated: true;
      user: HazoAuthUser;
      permissions: string[];
      permission_ok: boolean;
      missing_permissions?: string[];
      organization: TenantOrganization | null;
      /** Shorthand for organization?.id - commonly used for DB query filters */
      organization_id: string | null;
      user_scopes: ScopeDetails[];
      scope_ok?: boolean;
      scope_access_via?: ScopeAccessInfo;
    }
  | {
      authenticated: false;
      user: null;
      permissions: [];
      permission_ok: false;
      organization: null;
      /** Shorthand for organization?.id - commonly used for DB query filters */
      organization_id: null;
      user_scopes: [];
      scope_ok?: false;
    };

/**
 * Guaranteed authenticated result with non-null organization
 * Returned by require_tenant_auth when validation passes
 */
export type RequiredTenantAuthResult = TenantAuthResult & {
  authenticated: true;
  organization: TenantOrganization;
};

// section: tenant_error_classes

/**
 * Base error class for all hazo_auth errors
 * Provides error code and HTTP status code for API responses
 */
export class HazoAuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status_code: number,
  ) {
    super(message);
    this.name = "HazoAuthError";
  }
}

/**
 * Error thrown when authentication is required but user is not authenticated
 */
export class AuthenticationRequiredError extends HazoAuthError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_REQUIRED", 401);
    this.name = "AuthenticationRequiredError";
  }
}

/**
 * Error thrown when a tenant/scope context is required but not provided
 */
export class TenantRequiredError extends HazoAuthError {
  constructor(
    message: string = "Tenant context required",
    public readonly user_scopes: ScopeDetails[] = [],
  ) {
    super(message, "TENANT_REQUIRED", 403);
    this.name = "TenantRequiredError";
  }
}

/**
 * Error thrown when user lacks access to the requested tenant/scope
 */
export class TenantAccessDeniedError extends HazoAuthError {
  constructor(
    public readonly scope_id: string,
    public readonly user_scopes: ScopeDetails[] = [],
  ) {
    super(`Access denied to scope: ${scope_id}`, "TENANT_ACCESS_DENIED", 403);
    this.name = "TenantAccessDeniedError";
  }
}
