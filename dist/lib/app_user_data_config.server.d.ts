import "server-only";
/**
 * JSON Schema property definition (simplified subset)
 */
export type SchemaProperty = {
    type: "string" | "number" | "boolean" | "object";
    properties?: Record<string, SchemaProperty>;
};
/**
 * JSON Schema definition for app_user_data (simplified subset)
 */
export type AppUserDataSchema = {
    type: "object";
    properties: Record<string, SchemaProperty>;
};
/**
 * App user data configuration options
 */
export type AppUserDataConfig = {
    /** Whether schema-based editing is enabled (default: false) */
    enable_schema: boolean;
    /** JSON Schema for app_user_data structure */
    schema: AppUserDataSchema | null;
    /** Custom labels for top-level sections (key -> display label) */
    section_labels: Map<string, string>;
};
/**
 * Reads app_user_data configuration from hazo_auth_config.ini file
 * @returns App user data configuration options
 */
export declare function get_app_user_data_config(): AppUserDataConfig;
/**
 * Gets just the schema (or null if disabled/not configured)
 * Convenience function for API routes
 * @returns Schema or null
 */
export declare function get_app_user_data_schema(): AppUserDataSchema | null;
/**
 * Checks if schema-based editing is enabled
 * @returns true if schema editing is enabled and schema is valid
 */
export declare function is_app_user_data_schema_enabled(): boolean;
/**
 * Gets section label for a given key
 * Falls back to converting key to title case if no custom label
 * @param key - The schema property key
 * @returns Display label
 */
export declare function get_section_label(key: string): string;
/**
 * Converts a field key to a display label
 * Strips common prefixes and converts to title case
 * @param key - The field key (e.g., "eft_bsb_number")
 * @param parent_key - Optional parent key to strip as prefix
 * @returns Display label (e.g., "BSB Number")
 */
export declare function get_field_label(key: string, parent_key?: string): string;
//# sourceMappingURL=app_user_data_config.server.d.ts.map