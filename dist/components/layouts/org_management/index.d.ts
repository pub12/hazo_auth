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
/**
 * Standalone Organization Management layout component
 * Provides organization hierarchy management with CRUD operations
 * @param props - Component props
 * @returns Organization Management layout component
 */
export declare function OrgManagementLayout({ className, title, description, requiredPermission, globalAdminPermission, authRequiredMessage, permissionDeniedMessage, multiTenancyDisabledMessage, }: OrgManagementLayoutProps): import("react/jsx-runtime").JSX.Element;
export default OrgManagementLayout;
//# sourceMappingURL=index.d.ts.map