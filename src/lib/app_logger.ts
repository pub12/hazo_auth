// file_description: client-accessible wrapper for the main app logging service
// section: imports
import { create_logger_service } from "hazo_auth/server/logging/logger_service";

// section: constants
const APP_NAMESPACE = "hazo_auth_ui";

// section: logger_instance
/**
 * Creates a logger service instance for use in UI components
 * This uses the main app logging service and can be extended with an external logger
 * when provided as part of component setup
 */
export const create_app_logger = (
  external_logger?: {
    info?: (message: string, data?: Record<string, unknown>) => void;
    error?: (message: string, data?: Record<string, unknown>) => void;
    warn?: (message: string, data?: Record<string, unknown>) => void;
    debug?: (message: string, data?: Record<string, unknown>) => void;
  }
) => {
  return create_logger_service(APP_NAMESPACE, external_logger);
};

