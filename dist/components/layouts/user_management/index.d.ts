/** User type definition for the dropdown */
export type UserTypeOption = {
    key: string;
    label: string;
    badge_color: string;
};
export type UserManagementLayoutProps = {
    className?: string;
    /** Whether HRBAC is enabled (passed from server) */
    hrbacEnabled?: boolean;
    /** Whether user types feature is enabled (passed from server) */
    userTypesEnabled?: boolean;
    /** Available user types for dropdown (passed from server) */
    availableUserTypes?: UserTypeOption[];
};
/**
 * User Management layout component with tabs for managing users, roles, permissions, and HRBAC scopes
 * Tab 1: Manage Users - data table with user details and actions
 * Tab 2: Roles - roles-permissions matrix
 * Tab 3: Permissions - manage permissions from DB and config
 * Tab 4: Scope Labels - customize scope level labels (if HRBAC enabled)
 * Tab 5: Scope Hierarchy - manage HRBAC scopes (if HRBAC enabled)
 * Tab 6: User Scopes - assign scopes to users (if HRBAC enabled)
 * @param props - Component props
 * @returns User Management layout component
 */
export declare function UserManagementLayout({ className, hrbacEnabled, userTypesEnabled, availableUserTypes }: UserManagementLayoutProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map