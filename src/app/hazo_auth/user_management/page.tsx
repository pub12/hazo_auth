// file_description: render the user management page shell and mount the user management layout component within sidebar
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { UserManagementPageClient } from "./user_management_page_client";
import { is_hrbac_enabled } from "../../../lib/scope_hierarchy_config.server";
import { is_multi_tenancy_enabled } from "../../../lib/multi_tenancy_config.server";
import {
  is_user_types_enabled,
  get_all_user_types,
} from "../../../lib/user_types_config.server";

// section: component
export default function user_management_page() {
  // Get feature config from server
  const hrbacEnabled = is_hrbac_enabled();
  const multiTenancyEnabled = is_multi_tenancy_enabled();
  const userTypesEnabled = is_user_types_enabled();
  const availableUserTypes = userTypesEnabled
    ? get_all_user_types().map((t) => ({
        key: t.key,
        label: t.label,
        badge_color: t.badge_color,
      }))
    : [];

  return (
    <AuthPageShell>
      <UserManagementPageClient
        hrbacEnabled={hrbacEnabled}
        multiTenancyEnabled={multiTenancyEnabled}
        userTypesEnabled={userTypesEnabled}
        availableUserTypes={availableUserTypes}
      />
    </AuthPageShell>
  );
}

