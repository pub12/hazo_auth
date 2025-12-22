// file_description: server component that chooses between sidebar shell and standalone shell
// section: imports
import type { ReactNode } from "react";
import { SidebarLayoutWrapper } from "./sidebar_layout_wrapper";
import { StandaloneLayoutWrapper } from "./standalone_layout_wrapper";
import { get_ui_shell_config } from "../../../../lib/ui_shell_config.server";

// section: types
type AuthPageShellProps = {
  children: ReactNode;
  /** Force disable navbar for this page (e.g., dev_lock) */
  disableNavbar?: boolean;
};

// section: component
export function AuthPageShell({ children, disableNavbar = false }: AuthPageShellProps) {
  const uiShellConfig = get_ui_shell_config();

  if (uiShellConfig.layout_mode === "standalone") {
    // Build navbar props (or null if disabled)
    const navbarProps =
      !disableNavbar && uiShellConfig.navbar.enable_navbar
        ? {
            logo_path: uiShellConfig.navbar.logo_path,
            logo_width: uiShellConfig.navbar.logo_width,
            logo_height: uiShellConfig.navbar.logo_height,
            company_name: uiShellConfig.navbar.company_name,
            home_path: uiShellConfig.navbar.home_path,
            home_label: uiShellConfig.navbar.home_label,
            show_home_link: uiShellConfig.navbar.show_home_link,
            background_color: uiShellConfig.navbar.background_color,
            text_color: uiShellConfig.navbar.text_color,
            height: uiShellConfig.navbar.height,
          }
        : null;

    return (
      <StandaloneLayoutWrapper
        heading={uiShellConfig.standalone_heading}
        description={uiShellConfig.standalone_description}
        wrapperClassName={uiShellConfig.standalone_wrapper_class}
        contentClassName={uiShellConfig.standalone_content_class}
        showHeading={uiShellConfig.standalone_show_heading}
        showDescription={uiShellConfig.standalone_show_description}
        navbar={navbarProps}
        verticalCenter={uiShellConfig.vertical_center}
      >
        {children}
      </StandaloneLayoutWrapper>
    );
  }

  return <SidebarLayoutWrapper>{children}</SidebarLayoutWrapper>;
}
