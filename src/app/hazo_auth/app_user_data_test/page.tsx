// file_description: Test page for app_user_data functionality
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { AppUserDataTestLayout } from "../../../components/layouts/app_user_data_test";

export default function AppUserDataTestPage() {
  return (
    <AuthPageShell>
      <AppUserDataTestLayout />
    </AuthPageShell>
  );
}
