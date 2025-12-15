// file_description: Standalone Organization Management layout component for managing multi-tenancy organizations
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { useState, useEffect } from "react";
import { OrgHierarchyTab } from "../user_management/components/org_hierarchy_tab";
import { useHazoAuthConfig } from "../../../contexts/hazo_auth_provider";
import { use_hazo_auth } from "../shared/hooks/use_hazo_auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../../ui/card";
import { Loader2, AlertCircle, Shield, Building2, } from "lucide-react";
// section: component
/**
 * Standalone Organization Management layout component
 * Provides organization hierarchy management with CRUD operations
 * @param props - Component props
 * @returns Organization Management layout component
 */
export function OrgManagementLayout({ className, title = "Organization Management", description = "Manage your organization hierarchy and structure.", requiredPermission = "hazo_perm_org_management", globalAdminPermission = "hazo_org_global_admin", authRequiredMessage = "Please log in to access organization management.", permissionDeniedMessage = "You need organization management permission to access this page.", multiTenancyDisabledMessage = "Multi-tenancy is not enabled in the configuration.", }) {
    const { apiBasePath } = useHazoAuthConfig();
    const authResult = use_hazo_auth();
    const [multiTenancyEnabled, setMultiTenancyEnabled] = useState(null);
    const [checkingMultiTenancy, setCheckingMultiTenancy] = useState(true);
    // Check if multi-tenancy is enabled
    useEffect(() => {
        const checkMultiTenancy = async () => {
            try {
                const response = await fetch(`${apiBasePath}/org_management/orgs?action=list`);
                const data = await response.json();
                if (data.code === "MULTI_TENANCY_DISABLED") {
                    setMultiTenancyEnabled(false);
                }
                else {
                    setMultiTenancyEnabled(true);
                }
            }
            catch (error) {
                // If we can't check, assume enabled and let the component handle it
                setMultiTenancyEnabled(true);
            }
            finally {
                setCheckingMultiTenancy(false);
            }
        };
        if (authResult.authenticated && authResult.permissions.includes(requiredPermission)) {
            void checkMultiTenancy();
        }
        else {
            setCheckingMultiTenancy(false);
        }
    }, [apiBasePath, authResult.authenticated, authResult.permissions, requiredPermission]);
    // Loading state
    if (authResult.loading || checkingMultiTenancy) {
        return (_jsx("div", { className: `cls_org_management_layout flex items-center justify-center p-8 ${className || ""}`, children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) }));
    }
    // Not authenticated
    if (!authResult.authenticated) {
        return (_jsxs("div", { className: `cls_org_management_layout flex flex-col items-center justify-center p-8 gap-4 ${className || ""}`, children: [_jsx(AlertCircle, { className: "h-12 w-12 text-red-500" }), _jsx("h1", { className: "text-xl font-semibold", children: "Authentication Required" }), _jsx("p", { className: "text-muted-foreground text-center", children: authRequiredMessage })] }));
    }
    // Check required permission
    const hasOrgManagementPermission = authResult.permissions.includes(requiredPermission);
    if (!hasOrgManagementPermission) {
        return (_jsxs("div", { className: `cls_org_management_layout flex flex-col items-center justify-center p-8 gap-4 ${className || ""}`, children: [_jsx(Shield, { className: "h-12 w-12 text-amber-500" }), _jsx("h1", { className: "text-xl font-semibold", children: "Access Denied" }), _jsx("p", { className: "text-muted-foreground text-center", children: permissionDeniedMessage }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Required permission: ", _jsx("code", { className: "bg-muted px-1 py-0.5 rounded", children: requiredPermission })] })] }));
    }
    // Multi-tenancy disabled
    if (multiTenancyEnabled === false) {
        return (_jsxs("div", { className: `cls_org_management_layout flex flex-col items-center justify-center p-8 gap-4 ${className || ""}`, children: [_jsx(Building2, { className: "h-12 w-12 text-amber-500" }), _jsx("h1", { className: "text-xl font-semibold", children: "Multi-Tenancy Disabled" }), _jsx("p", { className: "text-muted-foreground text-center max-w-md", children: multiTenancyDisabledMessage }), _jsxs("p", { className: "text-xs text-muted-foreground text-center", children: ["Enable multi-tenancy by setting", " ", _jsx("code", { className: "bg-muted px-1 py-0.5 rounded", children: "enable_multi_tenancy = true" }), " in the", " ", _jsx("code", { className: "bg-muted px-1 py-0.5 rounded", children: "[hazo_auth__multi_tenancy]" }), " section."] })] }));
    }
    // Check global admin permission
    const isGlobalAdmin = authResult.permissions.includes(globalAdminPermission);
    return (_jsxs("div", { className: `cls_org_management_layout flex flex-col gap-6 p-4 w-full max-w-5xl mx-auto ${className || ""}`, children: [_jsxs("div", { className: "cls_org_management_header", children: [_jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [_jsx(Building2, { className: "h-6 w-6" }), title] }), _jsx("p", { className: "text-muted-foreground", children: description })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg", children: "Organization Hierarchy" }), _jsxs(CardDescription, { children: ["View and manage the organization structure.", isGlobalAdmin
                                        ? " As a global admin, you can see and manage all organizations."
                                        : " You can manage organizations within your access scope."] })] }), _jsx(CardContent, { children: _jsx(OrgHierarchyTab, { isGlobalAdmin: isGlobalAdmin }) })] })] }));
}
export default OrgManagementLayout;
