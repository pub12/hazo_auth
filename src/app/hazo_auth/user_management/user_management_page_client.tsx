// file_description: client component for user management page
// section: client_directive
"use client";

// section: imports
import { UserManagementLayout } from "../../../components/layouts/user_management";

// section: types
type UserManagementPageClientProps = {
  hrbacEnabled?: boolean;
  defaultOrg?: string;
};

// section: component
/**
 * Client component for user management page
 * @param props - Component props
 * @returns User Management layout component
 */
export function UserManagementPageClient({ hrbacEnabled = false, defaultOrg = "" }: UserManagementPageClientProps) {
  return <UserManagementLayout className="w-full" hrbacEnabled={hrbacEnabled} defaultOrg={defaultOrg} />;
}

