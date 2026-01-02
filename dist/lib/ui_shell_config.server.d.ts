import { type NavbarConfig } from "./navbar_config.server.js";
export type UiShellLayoutMode = "test_sidebar" | "standalone";
export type UiShellConfig = {
    layout_mode: UiShellLayoutMode;
    standalone_heading: string;
    standalone_description: string;
    standalone_wrapper_class: string;
    standalone_content_class: string;
    standalone_show_heading: boolean;
    standalone_show_description: boolean;
    /** Navbar configuration for standalone mode */
    navbar: NavbarConfig;
    /** Enable vertical centering in standalone mode */
    vertical_center: boolean;
};
/**
 * Reads ui shell configuration controlling whether pages use the sidebar test shell
 * or a clean standalone wrapper that inherits consumer project styling.
 */
export declare function get_ui_shell_config(): UiShellConfig;
//# sourceMappingURL=ui_shell_config.server.d.ts.map