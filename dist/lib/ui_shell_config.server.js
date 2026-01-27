// file_description: load ui shell layout settings from hazo_auth_config.ini
// section: server-only-guard
import "server-only";
// section: imports
import { get_config_value } from "./config/config_loader.server.js";
import { get_navbar_config } from "./navbar_config.server.js";
// section: helpers
/**
 * Reads ui shell configuration controlling whether pages use the sidebar test shell
 * or a clean standalone wrapper that inherits consumer project styling.
 */
export function get_ui_shell_config() {
    const section = "hazo_auth__ui_shell";
    const layoutModeValue = get_config_value(section, "layout_mode", "test_sidebar").toLowerCase();
    const layout_mode = layoutModeValue === "standalone" ? "standalone" : "test_sidebar";
    const standalone_heading = get_config_value(section, "standalone_heading", "Welcome to hazo auth");
    const standalone_description = get_config_value(section, "standalone_description", "Reuse the packaged authentication flows while inheriting your existing app shell styles.");
    const standalone_wrapper_class = get_config_value(section, "standalone_wrapper_class", "cls_standalone_shell flex min-h-screen w-full items-center justify-center bg-background px-4 py-10");
    const standalone_content_class = get_config_value(section, "standalone_content_class", "cls_standalone_shell_content w-full max-w-5xl shadow-xl rounded-2xl border bg-card");
    const standalone_show_heading = get_config_value(section, "standalone_show_heading", "true").toLowerCase() === "true";
    const standalone_show_description = get_config_value(section, "standalone_show_description", "true").toLowerCase() === "true";
    const vertical_center = get_config_value(section, "vertical_center", "true").toLowerCase() === "true";
    const navbar = get_navbar_config();
    return {
        layout_mode,
        standalone_heading,
        standalone_description,
        standalone_wrapper_class,
        standalone_content_class,
        standalone_show_heading,
        standalone_show_description,
        navbar,
        vertical_center,
    };
}
