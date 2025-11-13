// file_description: singleton instance of hazo_connect adapter - initialized once and reused across all routes
// This ensures all routes/components use the same database connection
// Uses the new hazo_connect singleton API from hazo_connect/nextjs/setup
// Reads configuration from hazo_auth_config.ini using hazo_config
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { getHazoConnectSingleton } from "hazo_connect/nextjs/setup";
import { create_sqlite_hazo_connect_server, get_hazo_connect_config_options } from "./hazo_connect_setup.server";
import { initializeAdminService, getSqliteAdminService } from "hazo_connect/server";
import { create_app_logger } from "./app_logger";

// section: singleton_state
let hazoConnectInstance: HazoConnectAdapter | null = null;
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
export function get_hazo_connect_instance(): HazoConnectAdapter {
  // Use the new singleton API from hazo_connect
  // This automatically handles:
  // - Instance reuse
  // - Admin service registration (via registerSqliteAdapter)
  // - Thread-safety for Next.js serverless
  // - Configuration from hazo_auth_config.ini (via hazo_config) or environment variables
  try {
    // Get configuration from hazo_auth_config.ini (falls back to environment variables)
    const config_options = get_hazo_connect_config_options();
    return getHazoConnectSingleton(config_options);
  } catch (error) {
    // Fallback: Manual singleton implementation if new API fails
    // This should not happen with the updated package, but kept for safety
    if (!hazoConnectInstance) {
      // Initialize admin service first (if not already done)
      if (!isInitialized) {
        initializeAdminService({ enable_admin_ui: true });
        isInitialized = true;
      }
      
      // Create the adapter instance (reads from hazo_auth_config.ini)
      hazoConnectInstance = create_sqlite_hazo_connect_server();

      // Note: Database migrations should be applied manually via SQLite Admin UI
      // or through a separate migration script. The token_service has fallback
      // logic to work without the token_type column if migration hasn't been applied.

      // Finalize initialization by getting the admin service.
      try {
        getSqliteAdminService();
      } catch (adminError) {
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
    
    return hazoConnectInstance;
  }
}

