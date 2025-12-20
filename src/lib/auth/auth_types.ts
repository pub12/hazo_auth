// file_description: Type definitions and error classes for hazo_get_auth utility
// section: types

/**
 * User data structure returned by hazo_get_auth
 */
export type HazoAuthUser = {
  id: string;
  name: string | null;
  email_address: string;
  is_active: boolean;
  profile_picture_url: string | null;
  // Multi-tenancy fields (only populated when multi-tenancy is enabled)
  org_id?: string | null;
  org_name?: string | null;
  parent_org_id?: string | null;
  parent_org_name?: string | null;
  root_org_id?: string | null;
  root_org_name?: string | null;
};

/**
 * Scope access information returned when HRBAC scope checking is used
 */
export type ScopeAccessInfo = {
  scope_type: string;
  scope_id: string;
  scope_seq: string;
};

/**
 * Result type for hazo_get_auth function
 * Returns authenticated state with user data and permissions, or unauthenticated state
 * Optionally includes scope access information when HRBAC is used
 * Optionally includes org_ok when require_org option is used
 */
export type HazoAuthResult =
  | {
      authenticated: true;
      user: HazoAuthUser;
      permissions: string[];
      permission_ok: boolean;
      missing_permissions?: string[];
      // HRBAC scope access fields (only present when scope options are provided)
      scope_ok?: boolean;
      scope_access_via?: ScopeAccessInfo;
      // Multi-tenancy org check (only present when require_org option is used)
      org_ok?: boolean;
    }
  | {
      authenticated: false;
      user: null;
      permissions: [];
      permission_ok: false;
      scope_ok?: false;
      org_ok?: false;
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
  // HRBAC (Hierarchical Role-Based Access Control) options
  /**
   * The scope level to check access for (e.g., "hazo_scopes_l3")
   * If provided along with scope_id or scope_seq, enables HRBAC checking
   */
  scope_type?: string;
  /**
   * The scope ID (UUID) to check access for
   * Takes precedence over scope_seq if both provided
   */
  scope_id?: string;
  /**
   * The scope seq (friendly ID like "L3_001") to check access for
   * Used if scope_id is not provided
   */
  scope_seq?: string;
  // Multi-tenancy options
  /**
   * If true, throws OrgRequiredError when user has no org_id assigned
   * Only checked when multi-tenancy is enabled
   * If false or not set (default), org_id is optional and org fields may be null
   */
  require_org?: boolean;
};

/**
 * Custom error class for permission denials
 * Includes technical and user-friendly error messages
 */
export class PermissionError extends Error {
  constructor(
    public missing_permissions: string[],
    public user_permissions: string[],
    public required_permissions: string[],
    public user_friendly_message?: string,
  ) {
    super(`Missing permissions: ${missing_permissions.join(", ")}`);
    this.name = "PermissionError";
  }
}

/**
 * Custom error class for scope access denials in HRBAC
 * Thrown when strict mode is enabled and user lacks access to required scope
 */
export class ScopeAccessError extends Error {
  constructor(
    public scope_type: string,
    public scope_identifier: string,
    public user_scopes: Array<{ scope_type: string; scope_id: string; scope_seq: string }>,
  ) {
    super(`Access denied to scope: ${scope_type} / ${scope_identifier}`);
    this.name = "ScopeAccessError";
  }
}

/**
 * Custom error class for missing organization assignment
 * Thrown when require_org: true is set but user has no org_id assigned
 */
export class OrgRequiredError extends Error {
  constructor(public user_id: string) {
    super(`User ${user_id} is not assigned to an organization`);
    this.name = "OrgRequiredError";
  }
}

