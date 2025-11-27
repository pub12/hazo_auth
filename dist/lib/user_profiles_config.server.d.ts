/**
 * User profiles cache configuration options
 */
export type UserProfilesCacheConfig = {
    cache_enabled: boolean;
    cache_max_entries: number;
    cache_ttl_minutes: number;
};
/**
 * Reads user profiles cache configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns User profiles cache configuration options
 */
export declare function get_user_profiles_cache_config(): UserProfilesCacheConfig;
//# sourceMappingURL=user_profiles_config.server.d.ts.map