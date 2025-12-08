// file_description: Scope test page for testing hazo_get_auth with HRBAC scope options
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { ScopeTestPageClient } from "./scope_test_page_client";
import { is_hrbac_enabled, get_default_org } from "../../../lib/scope_hierarchy_config.server";

// section: component
export default function scope_test_page() {
  // Get HRBAC config from server
  const hrbacEnabled = is_hrbac_enabled();
  const defaultOrg = get_default_org();

  return (
    <AuthPageShell>
      <ScopeTestPageClient hrbacEnabled={hrbacEnabled} defaultOrg={defaultOrg} />
    </AuthPageShell>
  );
}
