import { jsx as _jsx } from "react/jsx-runtime";
import { SidebarLayoutWrapper } from "./sidebar_layout_wrapper";
import { StandaloneLayoutWrapper } from "./standalone_layout_wrapper";
import { get_ui_shell_config } from "../../../../lib/ui_shell_config.server";
// section: component
export function AuthPageShell({ children }) {
    const uiShellConfig = get_ui_shell_config();
    if (uiShellConfig.layout_mode === "standalone") {
        return (_jsx(StandaloneLayoutWrapper, { heading: uiShellConfig.standalone_heading, description: uiShellConfig.standalone_description, wrapperClassName: uiShellConfig.standalone_wrapper_class, contentClassName: uiShellConfig.standalone_content_class, showHeading: uiShellConfig.standalone_show_heading, showDescription: uiShellConfig.standalone_show_description, children: children }));
    }
    return _jsx(SidebarLayoutWrapper, { children: children });
}
