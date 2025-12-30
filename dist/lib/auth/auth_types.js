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
/**
 * Custom error class for missing organization assignment
 * Thrown when require_org: true is set but user has no org_id assigned
 */
export class OrgRequiredError extends Error {
    constructor(user_id) {
        super(`User ${user_id} is not assigned to an organization`);
        this.user_id = user_id;
        this.name = "OrgRequiredError";
    }
}
