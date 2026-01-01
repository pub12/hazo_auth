// file_description: Type definitions and error classes for hazo_get_auth utility
// section: types

/**
 * User data structure returned by hazo_get_auth
 */
export type HazoAuthUser = {
  id: string;
  name: string | null;
  email_address: string;
  is_active: boolean; // Derived from status column: status === 'active'
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
