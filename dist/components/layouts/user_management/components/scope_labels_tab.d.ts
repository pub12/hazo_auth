export type ScopeLabelsTabProps = {
    className?: string;
};
/**
 * Scope Labels tab component for configuring friendly names for scope levels
 * Shows all 7 scope levels with their current labels from database
 * Empty inputs for levels without labels - no placeholders
 * Non-global admins see only their org's labels (auto-filtered by API)
 * Global admins can view/manage any org's labels by providing org_id
 * @param props - Component props
 * @returns Scope Labels tab component
 */
export declare function ScopeLabelsTab({ className }: ScopeLabelsTabProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=scope_labels_tab.d.ts.map