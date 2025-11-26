// section: helper_functions
const create_console_logger = (namespace) => {
    const write = (level, message, data) => {
        const timestamp = new Date().toISOString();
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({
            namespace,
            level,
            message,
            data,
            timestamp,
        }));
    };
    return {
        debug: (message, data) => write("debug", message, data),
        info: (message, data) => write("info", message, data),
        warn: (message, data) => write("warn", message, data),
        error: (message, data) => write("error", message, data),
    };
};
// section: factory
export const create_logger_service = (namespace, external_logger) => {
    const console_logger = create_console_logger(namespace);
    const safe_bind = (level, fallback) => {
        const candidate = external_logger === null || external_logger === void 0 ? void 0 : external_logger[level];
        if (typeof candidate === "function") {
            return (message, data) => candidate(message, data);
        }
        return fallback;
    };
    return {
        debug: safe_bind("debug", console_logger.debug),
        info: safe_bind("info", console_logger.info),
        warn: safe_bind("warn", console_logger.warn),
        error: safe_bind("error", console_logger.error),
    };
};
