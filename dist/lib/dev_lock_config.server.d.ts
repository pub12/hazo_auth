import "server-only";
export type DevLockConfig = {
    /** Enable the development lock screen */
    enable: boolean;
    /** Session duration in days */
    session_duration_days: number;
    /** Background color */
    background_color: string;
    /** Logo image path */
    logo_path: string;
    /** Logo width in pixels */
    logo_width: number;
    /** Logo height in pixels */
    logo_height: number;
    /** Application name displayed below logo */
    application_name: string;
    /** Limited access text displayed with lock icon */
    limited_access_text: string;
    /** Password input placeholder text */
    password_placeholder: string;
    /** Submit button text */
    submit_button_text: string;
    /** Error message for incorrect password */
    error_message: string;
    /** Text color for labels */
    text_color: string;
    /** Accent color for button */
    accent_color: string;
};
/**
 * Reads dev lock configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Dev lock configuration options
 */
export declare function get_dev_lock_config(): DevLockConfig;
/**
 * Helper to check if dev lock is enabled in config
 * Note: Also requires HAZO_AUTH_DEV_LOCK_ENABLED env var for actual enforcement
 * @returns true if dev lock is enabled in config
 */
export declare function is_dev_lock_enabled(): boolean;
//# sourceMappingURL=dev_lock_config.server.d.ts.map