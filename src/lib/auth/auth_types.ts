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
};

/**
 * Result type for hazo_get_auth function
 * Returns authenticated state with user data and permissions, or unauthenticated state
 */
export type HazoAuthResult =
  | {
      authenticated: true;
      user: HazoAuthUser;
      permissions: string[];
      permission_ok: boolean;
      missing_permissions?: string[];
    }
  | {
      authenticated: false;
      user: null;
      permissions: [];
      permission_ok: false;
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

