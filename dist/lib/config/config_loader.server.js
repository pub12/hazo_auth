// file_description: shared utility for reading configuration from hazo_auth_config.ini using hazo_config
// section: imports
import { HazoConfig } from "hazo_config/dist/lib";
import path from "path";
import fs from "fs";
import { create_app_logger } from "../app_logger.js";
// section: constants
const DEFAULT_CONFIG_FILE = "config/hazo_auth_config.ini";
// section: helpers
/**
 * Gets the default config file path
 * @param custom_path - Optional custom config file path
 * @returns Resolved config file path
 */
function get_config_file_path(custom_path) {
    if (custom_path) {
        return path.isAbsolute(custom_path) ? custom_path : path.resolve(process.cwd(), custom_path);
    }
    return path.resolve(process.cwd(), DEFAULT_CONFIG_FILE);
}
/**
 * Reads a section from the config file
 * @param section_name - Name of the section to read (e.g., "hazo_auth__register_layout")
 * @param file_path - Optional custom config file path (defaults to hazo_auth_config.ini)
 * @returns Section data as Record<string, string> or undefined if not found
 */
export function read_config_section(section_name, file_path) {
    const config_path = get_config_file_path(file_path);
    const logger = create_app_logger();
    if (!fs.existsSync(config_path)) {
        return undefined;
    }
    try {
        const hazo_config = new HazoConfig({
            filePath: config_path,
        });
        return hazo_config.getSection(section_name);
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.warn("config_loader_read_section_failed", {
            filename: "config_loader.server.ts",
            line_number: 0,
            section_name,
            config_path,
            error: error_message,
        });
        return undefined;
    }
}
/**
 * Gets a single config value from a section
 * @param section_name - Name of the section
 * @param key - Key name within the section
 * @param default_value - Default value if key is not found
 * @param file_path - Optional custom config file path
 * @returns Config value as string or default value
 */
export function get_config_value(section_name, key, default_value, file_path) {
    const section = read_config_section(section_name, file_path);
    // Optional chaining on section and section[key]
    // If section is undefined, or key is undefined, fall back to default
    if (!section || section[key] === undefined) {
        return default_value;
    }
    return section[key].trim() || default_value;
}
/**
 * Gets a boolean config value from a section
 * @param section_name - Name of the section
 * @param key - Key name within the section
 * @param default_value - Default boolean value if key is not found
 * @param file_path - Optional custom config file path
 * @returns Config value as boolean
 */
export function get_config_boolean(section_name, key, default_value, file_path) {
    const section = read_config_section(section_name, file_path);
    if (!section || section[key] === undefined) {
        return default_value;
    }
    const value = section[key].trim().toLowerCase();
    return value !== "false" && value !== "0" && value !== "";
}
/**
 * Gets a number config value from a section
 * @param section_name - Name of the section
 * @param key - Key name within the section
 * @param default_value - Default number value if key is not found or invalid
 * @param file_path - Optional custom config file path
 * @returns Config value as number
 */
export function get_config_number(section_name, key, default_value, file_path) {
    const section = read_config_section(section_name, file_path);
    if (!section || section[key] === undefined) {
        return default_value;
    }
    const value = section[key].trim();
    if (!value) {
        return default_value;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? default_value : parsed;
}
/**
 * Gets a comma-separated list config value from a section
 * @param section_name - Name of the section
 * @param key - Key name within the section
 * @param default_value - Default array value if key is not found
 * @param file_path - Optional custom config file path
 * @returns Config value as array of strings
 */
export function get_config_array(section_name, key, default_value, file_path) {
    const section = read_config_section(section_name, file_path);
    if (!section || section[key] === undefined) {
        return default_value;
    }
    const value = section[key].trim();
    if (!value) {
        return default_value;
    }
    return value.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
}
