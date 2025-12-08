// file_description: render the user management page shell and mount the user management layout component within sidebar
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { UserManagementPageClient } from "./user_management_page_client";
import { is_hrbac_enabled, get_default_org } from "../../../lib/scope_hierarchy_config.server";

// section: component
export default function user_management_page() {
  // Get HRBAC config from server
  const hrbacEnabled = is_hrbac_enabled();
  const defaultOrg = get_default_org();

  return (
    <AuthPageShell>
      <UserManagementPageClient hrbacEnabled={hrbacEnabled} defaultOrg={defaultOrg} />
    </AuthPageShell>
  );
}

