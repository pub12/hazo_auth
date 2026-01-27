// file_description: server-only helper to read app_user_data schema configuration from hazo_auth_config.ini
// section: server-only-guard
import "server-only";
// Enables schema-based editing of app_user_data in User Management
// section: imports
import { get_config_value, get_config_boolean, read_config_section, } from "./config/config_loader.server.js";
// section: constants
const SECTION_NAME = "hazo_auth__app_user_data";
// section: helpers
/**
 * Parses JSON schema from config string
 * @param schema_string - JSON string from config
 * @returns Parsed schema or null if invalid
 */
function parse_schema(schema_string) {
    if (!schema_string || schema_string.trim().length === 0) {
        return null;
    }
    try {
        const parsed = JSON.parse(schema_string);
        // Validate basic structure
        if (typeof parsed !== "object" ||
            parsed === null ||
            parsed.type !== "object" ||
            typeof parsed.properties !== "object") {
            console.warn("app_user_data_config: Invalid schema structure - must be an object with 'properties'");
            return null;
        }
        return parsed;
    }
    catch (error) {
        console.warn("app_user_data_config: Failed to parse schema JSON:", error);
        return null;
    }
}
/**
 * Extracts section labels from config section
 * Labels are defined as: label_<key> = Display Label
 * @param section - Config section object
 * @returns Map of key to display label
 */
function extract_section_labels(section) {
    const labels = new Map();
    if (!section) {
        return labels;
    }
    for (const [key, value] of Object.entries(section)) {
        if (key.startsWith("label_") && typeof value === "string" && value.trim()) {
            const section_key = key.substring(6); // Remove "label_" prefix
            labels.set(section_key, value.trim());
        }
    }
    return labels;
}
// section: exports
/**
 * Reads app_user_data configuration from hazo_auth_config.ini file
 * @returns App user data configuration options
 */
export function get_app_user_data_config() {
    const enable_schema = get_config_boolean(SECTION_NAME, "enable_schema", false);
    const schema_string = get_config_value(SECTION_NAME, "schema", "");
    const section = read_config_section(SECTION_NAME);
    return {
        enable_schema,
        schema: enable_schema ? parse_schema(schema_string) : null,
        section_labels: extract_section_labels(section),
    };
}
/**
 * Gets just the schema (or null if disabled/not configured)
 * Convenience function for API routes
 * @returns Schema or null
 */
export function get_app_user_data_schema() {
    const config = get_app_user_data_config();
    return config.enable_schema ? config.schema : null;
}
/**
 * Checks if schema-based editing is enabled
 * @returns true if schema editing is enabled and schema is valid
 */
export function is_app_user_data_schema_enabled() {
    const config = get_app_user_data_config();
    return config.enable_schema && config.schema !== null;
}
/**
 * Gets section label for a given key
 * Falls back to converting key to title case if no custom label
 * @param key - The schema property key
 * @returns Display label
 */
export function get_section_label(key) {
    const config = get_app_user_data_config();
    const custom_label = config.section_labels.get(key);
    if (custom_label) {
        return custom_label;
    }
    // Convert snake_case to Title Case
    return key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
/**
 * Converts a field key to a display label
 * Strips common prefixes and converts to title case
 * @param key - The field key (e.g., "eft_bsb_number")
 * @param parent_key - Optional parent key to strip as prefix
 * @returns Display label (e.g., "BSB Number")
 */
export function get_field_label(key, parent_key) {
    let label_key = key;
    // Strip parent key prefix if present (e.g., "postal_" from "postal_address_line_1")
    if (parent_key) {
        const prefix = parent_key + "_";
        if (label_key.startsWith(prefix)) {
            label_key = label_key.substring(prefix.length);
        }
        // Also try short prefix (e.g., "eft_" from "electronic_funds_transfer")
        const short_prefix_match = parent_key.match(/^(\w+)_/);
        if (short_prefix_match) {
            const short_prefix = short_prefix_match[1] + "_";
            if (label_key.startsWith(short_prefix)) {
                label_key = label_key.substring(short_prefix.length);
            }
        }
    }
    // Convert snake_case to Title Case
    return label_key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
