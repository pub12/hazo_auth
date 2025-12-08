// file_description: Type definitions and error classes for hazo_get_auth utility
// section: types
/**
 * Custom error class for permission denials
 * Includes technical and user-friendly error messages
 */
export class PermissionError extends Error {
    constructor(missing_permissions, user_permissions, required_permissions, user_friendly_message) {
        super(`Missing permissions: ${missing_permissions.join(", ")}`);
        this.missing_permissions = missing_permissions;
        this.user_permissions = user_permissions;
        this.required_permissions = required_permissions;
        this.user_friendly_message = user_friendly_message;
        this.name = "PermissionError";
    }
}
/**
 * Custom error class for scope access denials in HRBAC
 * Thrown when strict mode is enabled and user lacks access to required scope
 */
export class ScopeAccessError extends Error {
    constructor(scope_type, scope_identifier, user_scopes) {
        super(`Access denied to scope: ${scope_type} / ${scope_identifier}`);
        this.scope_type = scope_type;
        this.scope_identifier = scope_identifier;
        this.user_scopes = user_scopes;
        this.name = "ScopeAccessError";
    }
}
