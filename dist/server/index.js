var _a;
// file_description: bootstrap entry point for the hazo_auth express server
// section: imports
import http from "http";
import { create_server_app } from "./server";
import { createLogger } from "hazo_logs";
// section: constants
const default_port = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4100);
// section: bootstrap_runner
export const start_server = async () => {
    const logger = createLogger("hazo_auth_server");
    const app = create_server_app();
    const http_server = http.createServer(app);
    return new Promise((resolve, reject) => {
        http_server.listen(default_port, () => {
            logger.info("server_started", { port: default_port });
            resolve();
        });
        http_server.on("error", (error) => {
            logger.error("server_start_failed", { error: error.message });
            reject(error);
        });
    });
};
// section: direct_execution_guard
const resolved_module_path = new URL(import.meta.url).pathname;
const entry_module_path = process.argv[1] !== undefined ? new URL(`file://${process.argv[1]}`).pathname : undefined;
const is_primary_module = entry_module_path !== undefined && entry_module_path === resolved_module_path;
if (is_primary_module) {
    void start_server();
}
