/**
 * Firm branding configuration options
 */
export type FirmBrandingConfig = {
    /** Whether firm branding feature is enabled (default: true) */
    enable_branding: boolean;
    /** Default logo path for new firms (default: /hazo_auth/images/default_firm_logo.png) */
    default_logo_path: string;
    /** Upload path for firm logos (default: ./uploads/firm_logos) */
    logo_upload_path: string;
    /** Max logo file size in KB (default: 500) */
    max_logo_size_kb: number;
    /** Allowed logo formats as comma-separated string (default: png,jpg,jpeg,svg) */
    allowed_logo_formats: string[];
    /** Default primary color for new firms (default: empty, uses system default) */
    default_primary_color: string;
    /** Default secondary color for new firms (default: empty, uses system default) */
    default_secondary_color: string;
};
/**
 * Reads firm branding configuration from hazo_auth_config.ini file
 * Falls back to defaults if config file is not found or section is missing
 * @returns Firm branding configuration options
 */
export declare function get_branding_config(): FirmBrandingConfig;
/**
 * Checks if firm branding is enabled in the configuration
 * Convenience function for quick checks
 */
export declare function is_branding_enabled(): boolean;
/**
 * Validates if a file extension is allowed for logo uploads
 */
export declare function is_allowed_logo_format(extension: string): boolean;
/**
 * Gets the max file size in bytes for logo uploads
 */
export declare function get_max_logo_size_bytes(): number;
//# sourceMappingURL=branding_config.server.d.ts.map