// file_description: client-accessible wrapper for the main app logging service
// section: imports
import { create_logger_service } from "../server/logging/logger_service";
// section: constants
const APP_NAMESPACE = "hazo_auth_ui";
// section: logger_instance
/**
 * Creates a logger service instance for use in UI components
 * This uses the main app logging service and can be extended with an external logger
 * when provided as part of component setup
 */
export const create_app_logger = (external_logger) => {
    return create_logger_service(APP_NAMESPACE, external_logger);
};
