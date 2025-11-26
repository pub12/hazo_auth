/**
 * Reads a section from the config file
 * @param section_name - Name of the section to read (e.g., "hazo_auth__register_layout")
 * @param file_path - Optional custom config file path (defaults to hazo_auth_config.ini)
 * @returns Section data as Record<string, string> or undefined if not found
 */
export declare function read_config_section(section_name: string, file_path?: string): Record<string, string> | undefined;
/**
 * Gets a single config value from a section
 * @param section_name - Name of the section
 * @param key - Key name within the section
 * @param default_value - Default value if key is not found
 * @param file_path - Optional custom config file path
 * @returns Config value as string or default value
 */
export declare function get_config_value(section_name: string, key: string, default_value: string, file_path?: string): string;
/**
 * Gets a boolean config value from a section
 * @param section_name - Name of the section
 * @param key - Key name within the section
 * @param default_value - Default boolean value if key is not found
 * @param file_path - Optional custom config file path
 * @returns Config value as boolean
 */
export declare function get_config_boolean(section_name: string, key: string, default_value: boolean, file_path?: string): boolean;
/**
 * Gets a number config value from a section
 * @param section_name - Name of the section
 * @param key - Key name within the section
 * @param default_value - Default number value if key is not found or invalid
 * @param file_path - Optional custom config file path
 * @returns Config value as number
 */
export declare function get_config_number(section_name: string, key: string, default_value: number, file_path?: string): number;
/**
 * Gets a comma-separated list config value from a section
 * @param section_name - Name of the section
 * @param key - Key name within the section
 * @param default_value - Default array value if key is not found
 * @param file_path - Optional custom config file path
 * @returns Config value as array of strings
 */
export declare function get_config_array(section_name: string, key: string, default_value: string[], file_path?: string): string[];
//# sourceMappingURL=config_loader.server.d.ts.map