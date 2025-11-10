// file_description: expose the logging facade used across the hazo_auth backend
// section: imports
import type { logger_method, logger_service } from "../types/app_types";

// section: helper_functions
const create_console_logger = (namespace: string): logger_service => {
  const write = (level: string, message: string, data?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        namespace,
        level,
        message,
        data,
        timestamp,
      })
    );
  };

  return {
    debug: (message, data) => write("debug", message, data),
    info: (message, data) => write("info", message, data),
    warn: (message, data) => write("warn", message, data),
    error: (message, data) => write("error", message, data),
  };
};

// section: factory
export const create_logger_service = (
  namespace: string,
  external_logger?: Partial<logger_service>
): logger_service => {
  const console_logger = create_console_logger(namespace);

  const safe_bind = (
    level: keyof logger_service,
    fallback: logger_method
  ): logger_method => {
    const candidate = external_logger?.[level];
    if (typeof candidate === "function") {
      return (message, data) => candidate(message, data);
    }
    return fallback;
  };

  type logger_method = (message: string, data?: Record<string, unknown>) => void;

  return {
    debug: safe_bind("debug", console_logger.debug),
    info: safe_bind("info", console_logger.info),
    warn: safe_bind("warn", console_logger.warn),
    error: safe_bind("error", console_logger.error),
  };
};

