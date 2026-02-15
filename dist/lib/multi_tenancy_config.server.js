// file_description: server-only helper to read multi-tenancy configuration from hazo_auth_config.ini
// section: server-only-guard
import "server-only";
// section: imports
import { get_config_boolean, } from "./config/config_loader.server.js";
import { DEFAULT_MULTI_TENANCY } from "./config/default_config.js";
// section: constants
const SECTION_NAME = "hazo_auth__multi_tenancy";
// section: helpers
/**
 * Checks if multi-tenancy is enabled in the configuration
 * Returns false by default - consumers must explicitly enable multi-tenancy
 */
export function is_multi_tenancy_enabled() {
    return get_config_boolean(SECTION_NAME, "enable_multi_tenancy", DEFAULT_MULTI_TENANCY.enable_multi_tenancy);
}
