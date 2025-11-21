// file_description: render the user management page shell and mount the user management layout component within sidebar
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { UserManagementPageClient } from "./user_management_page_client";

// section: component
export default function user_management_page() {
  return (
    <AuthPageShell>
      <UserManagementPageClient />
    </AuthPageShell>
  );
}

