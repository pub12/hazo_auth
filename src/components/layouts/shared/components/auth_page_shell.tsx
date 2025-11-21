// file_description: server component that chooses between sidebar shell and standalone shell
// section: imports
import type { ReactNode } from "react";
import { SidebarLayoutWrapper } from "./sidebar_layout_wrapper";
import { StandaloneLayoutWrapper } from "./standalone_layout_wrapper";
import { get_ui_shell_config } from "../../../../lib/ui_shell_config.server";

// section: types
type AuthPageShellProps = {
  children: ReactNode;
};

// section: component
export function AuthPageShell({ children }: AuthPageShellProps) {
  const uiShellConfig = get_ui_shell_config();

  if (uiShellConfig.layout_mode === "standalone") {
    return (
      <StandaloneLayoutWrapper
        heading={uiShellConfig.standalone_heading}
        description={uiShellConfig.standalone_description}
        wrapperClassName={uiShellConfig.standalone_wrapper_class}
        contentClassName={uiShellConfig.standalone_content_class}
        showHeading={uiShellConfig.standalone_show_heading}
        showDescription={uiShellConfig.standalone_show_description}
      >
        {children}
      </StandaloneLayoutWrapper>
    );
  }

  return <SidebarLayoutWrapper>{children}</SidebarLayoutWrapper>;
}



