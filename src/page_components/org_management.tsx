// file_description: zero-config organization management page component for hazo_auth
// Consumers can use this directly without needing to configure props
"use client";

// section: imports
import org_management_layout from "../components/layouts/org_management";

// section: types
export type OrgManagementPageProps = {
  /** Title displayed at the top */
  title?: string;
  /** Description displayed below the title */
  description?: string;
  /** Required permission for org management (default: hazo_perm_org_management) */
  requiredPermission?: string;
  /** Permission for global admin access (default: hazo_org_global_admin) */
  globalAdminPermission?: string;
  /** Message shown when authentication is required */
  authRequiredMessage?: string;
  /** Message shown when permission is denied */
  permissionDeniedMessage?: string;
  /** Message shown when multi-tenancy is disabled */
  multiTenancyDisabledMessage?: string;
  /** Additional CSS classes */
  className?: string;
};

// section: component
/**
 * Zero-config organization management page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Organization management page component
 */
export function OrgManagementPage({
  title = "Organization Management",
  description = "Manage your organization hierarchy and structure.",
  requiredPermission = "hazo_perm_org_management",
  globalAdminPermission = "hazo_org_global_admin",
  authRequiredMessage = "Please log in to access organization management.",
  permissionDeniedMessage = "You need organization management permission to access this page.",
  multiTenancyDisabledMessage = "Multi-tenancy is not enabled in the configuration.",
  className,
}: OrgManagementPageProps = {}) {
  const OrgManagementLayout = org_management_layout;

  return (
    <OrgManagementLayout
      title={title}
      description={description}
      requiredPermission={requiredPermission}
      globalAdminPermission={globalAdminPermission}
      authRequiredMessage={authRequiredMessage}
      permissionDeniedMessage={permissionDeniedMessage}
      multiTenancyDisabledMessage={multiTenancyDisabledMessage}
      className={className}
    />
  );
}

export default OrgManagementPage;
