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
