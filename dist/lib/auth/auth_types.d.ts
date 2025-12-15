/**
 * User data structure returned by hazo_get_auth
 */
export type HazoAuthUser = {
    id: string;
    name: string | null;
    email_address: string;
    is_active: boolean;
    profile_picture_url: string | null;
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
 */
export type HazoAuthResult = {
    authenticated: true;
    user: HazoAuthUser;
    permissions: string[];
    permission_ok: boolean;
    missing_permissions?: string[];
    scope_ok?: boolean;
    scope_access_via?: ScopeAccessInfo;
} | {
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
};
/**
 * Custom error class for permission denials
 * Includes technical and user-friendly error messages
 */
export declare class PermissionError extends Error {
    missing_permissions: string[];
    user_permissions: string[];
    required_permissions: string[];
    user_friendly_message?: string | undefined;
    constructor(missing_permissions: string[], user_permissions: string[], required_permissions: string[], user_friendly_message?: string | undefined);
}
/**
 * Custom error class for scope access denials in HRBAC
 * Thrown when strict mode is enabled and user lacks access to required scope
 */
export declare class ScopeAccessError extends Error {
    scope_type: string;
    scope_identifier: string;
    user_scopes: Array<{
        scope_type: string;
        scope_id: string;
        scope_seq: string;
    }>;
    constructor(scope_type: string, scope_identifier: string, user_scopes: Array<{
        scope_type: string;
        scope_id: string;
        scope_seq: string;
    }>);
}
//# sourceMappingURL=auth_types.d.ts.map