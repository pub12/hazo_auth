// file_description: Test page for ProfileStamp component
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { ProfileStampTestLayout } from "../../../components/layouts/profile_stamp_test";

export default function ProfileStampTestPage() {
  return (
    <AuthPageShell>
      <ProfileStampTestLayout />
    </AuthPageShell>
  );
}
