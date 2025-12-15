// file_description: Standalone Organization Management layout component for managing multi-tenancy organizations
// section: client_directive
"use client";

// section: imports
import { useState, useEffect } from "react";
import { OrgHierarchyTab } from "../user_management/components/org_hierarchy_tab";
import { useHazoAuthConfig } from "../../../contexts/hazo_auth_provider";
import { use_hazo_auth } from "../shared/hooks/use_hazo_auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Loader2,
  AlertCircle,
  Shield,
  Building2,
} from "lucide-react";

// section: types
export type OrgManagementLayoutProps = {
  className?: string;
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
};

// section: component
/**
 * Standalone Organization Management layout component
 * Provides organization hierarchy management with CRUD operations
 * @param props - Component props
 * @returns Organization Management layout component
 */
export function OrgManagementLayout({
  className,
  title = "Organization Management",
  description = "Manage your organization hierarchy and structure.",
  requiredPermission = "hazo_perm_org_management",
  globalAdminPermission = "hazo_org_global_admin",
  authRequiredMessage = "Please log in to access organization management.",
  permissionDeniedMessage = "You need organization management permission to access this page.",
  multiTenancyDisabledMessage = "Multi-tenancy is not enabled in the configuration.",
}: OrgManagementLayoutProps) {
  const { apiBasePath } = useHazoAuthConfig();
  const authResult = use_hazo_auth();
  const [multiTenancyEnabled, setMultiTenancyEnabled] = useState<boolean | null>(null);
  const [checkingMultiTenancy, setCheckingMultiTenancy] = useState(true);

  // Check if multi-tenancy is enabled
  useEffect(() => {
    const checkMultiTenancy = async () => {
      try {
        const response = await fetch(`${apiBasePath}/org_management/orgs?action=list`);
        const data = await response.json();

        if (data.code === "MULTI_TENANCY_DISABLED") {
          setMultiTenancyEnabled(false);
        } else {
          setMultiTenancyEnabled(true);
        }
      } catch (error) {
        // If we can't check, assume enabled and let the component handle it
        setMultiTenancyEnabled(true);
      } finally {
        setCheckingMultiTenancy(false);
      }
    };

    if (authResult.authenticated && authResult.permissions.includes(requiredPermission)) {
      void checkMultiTenancy();
    } else {
      setCheckingMultiTenancy(false);
    }
  }, [apiBasePath, authResult.authenticated, authResult.permissions, requiredPermission]);

  // Loading state
  if (authResult.loading || checkingMultiTenancy) {
    return (
      <div className={`cls_org_management_layout flex items-center justify-center p-8 ${className || ""}`}>
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // Not authenticated
  if (!authResult.authenticated) {
    return (
      <div className={`cls_org_management_layout flex flex-col items-center justify-center p-8 gap-4 ${className || ""}`}>
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-semibold">Authentication Required</h1>
        <p className="text-muted-foreground text-center">{authRequiredMessage}</p>
      </div>
    );
  }

  // Check required permission
  const hasOrgManagementPermission = authResult.permissions.includes(requiredPermission);
  if (!hasOrgManagementPermission) {
    return (
      <div className={`cls_org_management_layout flex flex-col items-center justify-center p-8 gap-4 ${className || ""}`}>
        <Shield className="h-12 w-12 text-amber-500" />
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-center">
          {permissionDeniedMessage}
        </p>
        <p className="text-xs text-muted-foreground">
          Required permission: <code className="bg-muted px-1 py-0.5 rounded">{requiredPermission}</code>
        </p>
      </div>
    );
  }

  // Multi-tenancy disabled
  if (multiTenancyEnabled === false) {
    return (
      <div className={`cls_org_management_layout flex flex-col items-center justify-center p-8 gap-4 ${className || ""}`}>
        <Building2 className="h-12 w-12 text-amber-500" />
        <h1 className="text-xl font-semibold">Multi-Tenancy Disabled</h1>
        <p className="text-muted-foreground text-center max-w-md">
          {multiTenancyDisabledMessage}
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Enable multi-tenancy by setting{" "}
          <code className="bg-muted px-1 py-0.5 rounded">enable_multi_tenancy = true</code> in the{" "}
          <code className="bg-muted px-1 py-0.5 rounded">[hazo_auth__multi_tenancy]</code> section.
        </p>
      </div>
    );
  }

  // Check global admin permission
  const isGlobalAdmin = authResult.permissions.includes(globalAdminPermission);

  return (
    <div className={`cls_org_management_layout flex flex-col gap-6 p-4 w-full max-w-5xl mx-auto ${className || ""}`}>
      {/* Header */}
      <div className="cls_org_management_header">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Organization Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization Hierarchy</CardTitle>
          <CardDescription>
            View and manage the organization structure.
            {isGlobalAdmin
              ? " As a global admin, you can see and manage all organizations."
              : " You can manage organizations within your access scope."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrgHierarchyTab isGlobalAdmin={isGlobalAdmin} />
        </CardContent>
      </Card>
    </div>
  );
}

export default OrgManagementLayout;
