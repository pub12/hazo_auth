// file_description: client component for user management page
// section: client_directive
"use client";

// section: imports
import { UserManagementLayout } from "../../../components/layouts/user_management";

// section: component
/**
 * Client component for user management page
 * @returns User Management layout component
 */
export function UserManagementPageClient() {
  return <UserManagementLayout className="w-full" />;
}

