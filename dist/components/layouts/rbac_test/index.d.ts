export type RbacTestLayoutProps = {
    className?: string;
    /** Whether HRBAC is enabled (passed from server) */
    hrbacEnabled?: boolean;
    /** Default organization for HRBAC scopes */
    defaultOrg?: string;
};
/**
 * RBAC/HRBAC Test layout component
 * Allows testing permissions and scope access for different users
 * @param props - Component props
 * @returns RBAC test layout component
 */
export declare function RbacTestLayout({ className, hrbacEnabled, defaultOrg, }: RbacTestLayoutProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map