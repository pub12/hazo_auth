export type UnauthorizedGuardProps = {
    message?: string;
    loginButtonLabel?: string;
    loginPath?: string;
    children: React.ReactNode;
};
/**
 * Guard component that shows unauthorized message if user is not authenticated
 * Otherwise renders children
 * @param props - Component props including message and login button customization
 * @returns Either the unauthorized UI or the children
 */
export declare function UnauthorizedGuard({ message, loginButtonLabel, loginPath, children, }: UnauthorizedGuardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=unauthorized_guard.d.ts.map