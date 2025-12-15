// file_description: zero-config organization management page component for hazo_auth
// Consumers can use this directly without needing to configure props
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// section: imports
import org_management_layout from "../components/layouts/org_management";
// section: component
/**
 * Zero-config organization management page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Organization management page component
 */
export function OrgManagementPage({ title = "Organization Management", description = "Manage your organization hierarchy and structure.", requiredPermission = "hazo_perm_org_management", globalAdminPermission = "hazo_org_global_admin", authRequiredMessage = "Please log in to access organization management.", permissionDeniedMessage = "You need organization management permission to access this page.", multiTenancyDisabledMessage = "Multi-tenancy is not enabled in the configuration.", className, } = {}) {
    const OrgManagementLayout = org_management_layout;
    return (_jsx(OrgManagementLayout, { title: title, description: description, requiredPermission: requiredPermission, globalAdminPermission: globalAdminPermission, authRequiredMessage: authRequiredMessage, permissionDeniedMessage: permissionDeniedMessage, multiTenancyDisabledMessage: multiTenancyDisabledMessage, className: className }));
}
export default OrgManagementPage;
