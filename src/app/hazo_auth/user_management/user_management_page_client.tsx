// file_description: client component for user management page
// section: client_directive
"use client";

// section: imports
import { UserManagementLayout } from "../../../components/layouts/user_management";

// section: types
type UserTypeOption = {
  key: string;
  label: string;
  badge_color: string;
};

type UserManagementPageClientProps = {
  hrbacEnabled?: boolean;
  multiTenancyEnabled?: boolean;
  userTypesEnabled?: boolean;
  availableUserTypes?: UserTypeOption[];
};

// section: component
/**
 * Client component for user management page
 * Note: org_id is now determined from the authenticated user's context via API
 * @param props - Component props
 * @returns User Management layout component
 */
export function UserManagementPageClient({
  hrbacEnabled = false,
  multiTenancyEnabled = false,
  userTypesEnabled = false,
  availableUserTypes = [],
}: UserManagementPageClientProps) {
  return (
    <UserManagementLayout
      className="w-full"
      hrbacEnabled={hrbacEnabled}
      multiTenancyEnabled={multiTenancyEnabled}
      userTypesEnabled={userTypesEnabled}
      availableUserTypes={availableUserTypes}
    />
  );
}

