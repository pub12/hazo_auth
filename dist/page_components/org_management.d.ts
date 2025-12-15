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
/**
 * Zero-config organization management page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Organization management page component
 */
export declare function OrgManagementPage({ title, description, requiredPermission, globalAdminPermission, authRequiredMessage, permissionDeniedMessage, multiTenancyDisabledMessage, className, }?: OrgManagementPageProps): import("react/jsx-runtime").JSX.Element;
export default OrgManagementPage;
//# sourceMappingURL=org_management.d.ts.map