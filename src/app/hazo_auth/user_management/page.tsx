// file_description: render the user management page shell and mount the user management layout component within sidebar
// section: imports
import { SidebarLayoutWrapper } from "@/components/layouts/shared/components/sidebar_layout_wrapper";
import { UserManagementPageClient } from "./user_management_page_client";

// section: component
export default function user_management_page() {
  return (
    <SidebarLayoutWrapper>
      <UserManagementPageClient />
    </SidebarLayoutWrapper>
  );
}

