/**
 * Creates a logger service instance for use in UI components
 * This uses the main app logging service and can be extended with an external logger
 * when provided as part of component setup
 */
export declare const create_app_logger: (external_logger?: {
    info?: (message: string, data?: Record<string, unknown>) => void;
    error?: (message: string, data?: Record<string, unknown>) => void;
    warn?: (message: string, data?: Record<string, unknown>) => void;
    debug?: (message: string, data?: Record<string, unknown>) => void;
}) => import("../server/types/app_types").logger_service;
//# sourceMappingURL=app_logger.d.ts.map