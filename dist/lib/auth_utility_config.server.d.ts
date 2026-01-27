import "server-only";
/**
 * Auth utility configuration options
 */
export type AuthUtilityConfig = {
    cache_max_users: number;
    cache_ttl_minutes: number;
    cache_max_age_minutes: number;
    rate_limit_per_user: number;
    rate_limit_per_ip: number;
    log_permission_denials: boolean;
    enable_friendly_error_messages: boolean;
    permission_error_messages: Map<string, string>;
};
/**
 * Reads auth utility configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Auth utility configuration options
 */
export declare function get_auth_utility_config(): AuthUtilityConfig;
//# sourceMappingURL=auth_utility_config.server.d.ts.map