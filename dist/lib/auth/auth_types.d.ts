/**
 * User data structure returned by hazo_get_auth
 */
export type HazoAuthUser = {
    id: string;
    name: string | null;
    email_address: string;
    is_active: boolean;
    profile_picture_url: string | null;
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
export declare class PermissionError extends Error {
    missing_permissions: string[];
    user_permissions: string[];
    required_permissions: string[];
    user_friendly_message?: string | undefined;
    permission_descriptions?: Map<string, string> | undefined;
    constructor(missing_permissions: string[], user_permissions: string[], required_permissions: string[], user_friendly_message?: string | undefined, permission_descriptions?: Map<string, string> | undefined);
}
/**
 * Custom error class for scope access denials
 * Thrown when strict mode is enabled and user lacks access to required scope
 */
export declare class ScopeAccessError extends Error {
    scope_id: string;
    user_scopes: Array<{
        scope_id: string;
        scope_name?: string;
    }>;
    constructor(scope_id: string, user_scopes: Array<{
        scope_id: string;
        scope_name?: string;
    }>);
}
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
export type TenantAuthResult = {
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
} | {
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
/**
 * Base error class for all hazo_auth errors
 * Provides error code and HTTP status code for API responses
 */
export declare class HazoAuthError extends Error {
    readonly code: string;
    readonly status_code: number;
    constructor(message: string, code: string, status_code: number);
}
/**
 * Error thrown when authentication is required but user is not authenticated
 */
export declare class AuthenticationRequiredError extends HazoAuthError {
    constructor(message?: string);
}
/**
 * Error thrown when a tenant/scope context is required but not provided
 */
export declare class TenantRequiredError extends HazoAuthError {
    readonly user_scopes: ScopeDetails[];
    constructor(message?: string, user_scopes?: ScopeDetails[]);
}
/**
 * Error thrown when user lacks access to the requested tenant/scope
 */
export declare class TenantAccessDeniedError extends HazoAuthError {
    readonly scope_id: string;
    readonly user_scopes: ScopeDetails[];
    constructor(scope_id: string, user_scopes?: ScopeDetails[]);
}
//# sourceMappingURL=auth_types.d.ts.map