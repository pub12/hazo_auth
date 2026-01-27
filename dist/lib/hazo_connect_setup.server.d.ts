import "server-only";
/**
 * Server-only function to create hazo_connect adapter
 * Reads configuration from hazo_auth_config.ini using hazo_config, falls back to environment variables
 * This should only be called from server-side code (API routes, server components)
 */
export declare function create_sqlite_hazo_connect_server(): import("hazo_connect").HazoConnectAdapter;
/**
 * Gets hazo_connect configuration options for use with singleton API
 * Reads from hazo_auth_config.ini using hazo_config, falls back to environment variables
 * @returns Configuration options compatible with getHazoConnectSingleton
 */
export declare function get_hazo_connect_config_options(): {
    type?: "sqlite" | "postgrest";
    sqlitePath?: string;
    enableAdminUi?: boolean;
    readOnly?: boolean;
    baseUrl?: string;
    apiKey?: string;
};
//# sourceMappingURL=hazo_connect_setup.server.d.ts.map