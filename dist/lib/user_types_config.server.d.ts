import "server-only";
/**
 * Badge color preset names supported by the UserTypeBadge component
 */
export type BadgeColorPreset = "blue" | "green" | "red" | "yellow" | "purple" | "gray" | "orange" | "pink";
/**
 * Individual user type definition parsed from config
 */
export type UserTypeDefinition = {
    /** Unique key stored in database (e.g., "admin", "standard") */
    key: string;
    /** Display label (e.g., "Administrator", "Standard User") */
    label: string;
    /** Badge color - preset name or hex value */
    badge_color: string;
    /** Whether this is a preset color or custom hex */
    is_preset_color: boolean;
};
/**
 * User types configuration options
 */
export type UserTypesConfig = {
    /** Whether user types feature is enabled (default: false) */
    enable_user_types: boolean;
    /** Default user type for new users (empty = no default) */
    default_user_type: string;
    /** Map of user type definitions by key */
    user_types: Map<string, UserTypeDefinition>;
};
/**
 * Reads user types configuration from hazo_auth_config.ini file
 * Falls back to defaults if config file is not found or section is missing
 * @returns User types configuration options
 */
export declare function get_user_types_config(): UserTypesConfig;
/**
 * Checks if user types feature is enabled in the configuration
 * Convenience function for quick checks
 */
export declare function is_user_types_enabled(): boolean;
/**
 * Gets the default user type from config
 * Returns empty string if not configured
 */
export declare function get_default_user_type(): string;
/**
 * Gets user type definition by key
 * @param type_key - The user type key
 * @returns UserTypeDefinition or undefined if not found
 */
export declare function get_user_type_by_key(type_key: string): UserTypeDefinition | undefined;
/**
 * Gets all user type definitions as array (for UI dropdowns)
 * @returns Array of UserTypeDefinition objects
 */
export declare function get_all_user_types(): UserTypeDefinition[];
//# sourceMappingURL=user_types_config.server.d.ts.map