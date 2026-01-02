// file_description: demo page for testing branding editor (edit firm) component
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { EditFirmPageClient } from "./edit_firm_page_client";

export default function Page() {
  return (
    <AuthPageShell>
      <EditFirmPageClient />
    </AuthPageShell>
  );
}
