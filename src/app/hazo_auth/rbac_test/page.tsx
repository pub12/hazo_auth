// file_description: RBAC and HRBAC test page for testing role-based and hierarchical access control
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { RbacTestLayout } from "../../../components/layouts/rbac_test";
import { is_hrbac_enabled } from "../../../lib/scope_hierarchy_config.server";

// section: component
export default function rbac_test_page() {
  // Get HRBAC config from server
  const hrbacEnabled = is_hrbac_enabled();

  return (
    <AuthPageShell>
      <RbacTestLayout hrbacEnabled={hrbacEnabled} />
    </AuthPageShell>
  );
}
