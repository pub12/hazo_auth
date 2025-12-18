// file_description: client-accessible wrapper for the main app logging service using hazo_logs
// section: imports
import { createLogger } from "hazo_logs";

// section: logger_instance
// Create a singleton logger for the hazo_auth package
const logger = createLogger("hazo_auth");

/**
 * Returns the hazo_auth logger instance
 * Uses hazo_logs for consistent logging across hazo packages
 */
export const create_app_logger = () => logger;

