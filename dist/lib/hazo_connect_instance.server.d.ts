import type { HazoConnectAdapter } from "hazo_connect";
/**
 * Gets or creates the singleton hazo_connect adapter instance
 * This ensures all routes/components use the same database connection
 *
 * Uses the new hazo_connect singleton API which:
 * - Automatically reuses the adapter instance
 * - Automatically registers SQLite adapters with the admin service
 * - Is thread-safe for Next.js serverless environments
 * - Reads configuration from hazo_auth_config.ini using hazo_config (falls back to environment variables)
 *
 * Falls back to manual singleton if the new API is not available
 *
 * @returns The singleton HazoConnectAdapter instance
 */
export declare function get_hazo_connect_instance(): HazoConnectAdapter;
//# sourceMappingURL=hazo_connect_instance.server.d.ts.map