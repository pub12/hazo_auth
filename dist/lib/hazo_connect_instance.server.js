import { getHazoConnectSingleton } from "hazo_connect/nextjs/setup";
import { create_sqlite_hazo_connect_server, get_hazo_connect_config_options } from "./hazo_connect_setup.server";
import { initializeAdminService, getSqliteAdminService } from "hazo_connect/server";
import { create_app_logger } from "./app_logger";
// section: singleton_state
let hazoConnectInstance = null;
let isInitialized = false;
// section: helpers
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
export function get_hazo_connect_instance() {
    // Use the new singleton API from hazo_connect
    // This automatically handles:
    // - Instance reuse
    // - Admin service registration (via registerSqliteAdapter)
    // - Thread-safety for Next.js serverless
    // - Configuration from hazo_auth_config.ini (via hazo_config) or environment variables
    try {
        // Get configuration from hazo_auth_config.ini (falls back to environment variables)
        const config_options = get_hazo_connect_config_options();
        const logger = create_app_logger();
        logger.debug("hazo_connect_singleton_attempt", {
            filename: "hazo_connect_instance.server.ts",
            line_number: 38,
            config_options,
            note: "Attempting to get singleton with these options",
        });
        return getHazoConnectSingleton(config_options);
    }
    catch (error) {
        const logger = create_app_logger();
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("hazo_connect_singleton_failed", {
            filename: "hazo_connect_instance.server.ts",
            line_number: 45,
            error: error_message,
            error_stack: error instanceof Error ? error.stack : undefined,
            note: "Falling back to manual singleton implementation",
        });
        // Fallback: Manual singleton implementation if new API fails
        // This should not happen with the updated package, but kept for safety
        if (!hazoConnectInstance) {
            // Get config options to determine database type
            const config_options = get_hazo_connect_config_options();
            const db_type = config_options.type;
            // Only initialize SQLite admin service for SQLite databases
            if (db_type === "sqlite" && !isInitialized) {
                initializeAdminService({ enable_admin_ui: true });
                isInitialized = true;
            }
            // Create the adapter instance (reads from hazo_auth_config.ini)
            // Note: Despite the name, this function supports both SQLite and PostgREST
            hazoConnectInstance = create_sqlite_hazo_connect_server();
            // Note: Database migrations should be applied manually via SQLite Admin UI
            // or through a separate migration script. The token_service has fallback
            // logic to work without the token_type column if migration hasn't been applied.
            // Finalize initialization by getting the admin service (only for SQLite)
            if (db_type === "sqlite") {
                try {
                    getSqliteAdminService();
                }
                catch (adminError) {
                    const logger = create_app_logger();
                    const error_message = adminError instanceof Error ? adminError.message : "Unknown error";
                    logger.warn("hazo_connect_instance_admin_service_init_failed", {
                        filename: "hazo_connect_instance.server.ts",
                        line_number: 0,
                        error: error_message,
                        note: "Could not get SqliteAdminService during initialization, continuing...",
                    });
                }
            }
        }
        return hazoConnectInstance;
    }
}
