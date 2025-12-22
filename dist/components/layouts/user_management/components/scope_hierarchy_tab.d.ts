export type ScopeHierarchyTabProps = {
    className?: string;
};
/**
 * Scope Hierarchy tab component for managing HRBAC scopes
 * Displays scopes in a tree view for intuitive hierarchy configuration
 * Non-global admins see only their org's scopes (auto-filtered by API)
 * Global admins can view/manage any org's scopes by providing org_id
 * @param props - Component props
 * @returns Scope Hierarchy tab component
 */
export declare function ScopeHierarchyTab({ className, }: ScopeHierarchyTabProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=scope_hierarchy_tab.d.ts.map