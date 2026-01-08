// file_description: Type definitions and error classes for hazo_get_auth utility
// section: types
/**
 * Custom error class for permission denials
 * Includes technical and user-friendly error messages
 * Optionally includes permission descriptions for debugging
 */
export class PermissionError extends Error {
    constructor(missing_permissions, user_permissions, required_permissions, user_friendly_message, permission_descriptions) {
        super(`Missing permissions: ${missing_permissions.join(", ")}`);
        this.missing_permissions = missing_permissions;
        this.user_permissions = user_permissions;
        this.required_permissions = required_permissions;
        this.user_friendly_message = user_friendly_message;
        this.permission_descriptions = permission_descriptions;
        this.name = "PermissionError";
    }
}
/**
 * Custom error class for scope access denials
 * Thrown when strict mode is enabled and user lacks access to required scope
 */
export class ScopeAccessError extends Error {
    constructor(scope_id, user_scopes) {
        super(`Access denied to scope: ${scope_id}`);
        this.scope_id = scope_id;
        this.user_scopes = user_scopes;
        this.name = "ScopeAccessError";
    }
}
// section: tenant_error_classes
/**
 * Base error class for all hazo_auth errors
 * Provides error code and HTTP status code for API responses
 */
export class HazoAuthError extends Error {
    constructor(message, code, status_code) {
        super(message);
        this.code = code;
        this.status_code = status_code;
        this.name = "HazoAuthError";
    }
}
/**
 * Error thrown when authentication is required but user is not authenticated
 */
export class AuthenticationRequiredError extends HazoAuthError {
    constructor(message = "Authentication required") {
        super(message, "AUTHENTICATION_REQUIRED", 401);
        this.name = "AuthenticationRequiredError";
    }
}
/**
 * Error thrown when a tenant/scope context is required but not provided
 */
export class TenantRequiredError extends HazoAuthError {
    constructor(message = "Tenant context required", user_scopes = []) {
        super(message, "TENANT_REQUIRED", 403);
        this.user_scopes = user_scopes;
        this.name = "TenantRequiredError";
    }
}
/**
 * Error thrown when user lacks access to the requested tenant/scope
 */
export class TenantAccessDeniedError extends HazoAuthError {
    constructor(scope_id, user_scopes = []) {
        super(`Access denied to scope: ${scope_id}`, "TENANT_ACCESS_DENIED", 403);
        this.scope_id = scope_id;
        this.user_scopes = user_scopes;
        this.name = "TenantAccessDeniedError";
    }
}
