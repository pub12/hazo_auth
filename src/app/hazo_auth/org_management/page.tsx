// file_description: Organization management demo page for managing multi-tenancy organizations
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { OrgManagementLayout } from "../../../components/layouts/org_management";

// section: component
export default function org_management_page() {
  return (
    <AuthPageShell>
      <OrgManagementLayout />
    </AuthPageShell>
  );
}
