import { type AuthNavbarProps } from "./auth_navbar";
export type StandaloneLayoutWrapperProps = {
    children: React.ReactNode;
    heading?: string;
    description?: string;
    wrapperClassName?: string;
    contentClassName?: string;
    showHeading?: boolean;
    showDescription?: boolean;
    /** Navbar configuration (pass null to disable navbar) */
    navbar?: AuthNavbarProps | null;
    /** Enable vertical centering of content (default: true) */
    verticalCenter?: boolean;
};
export declare function StandaloneLayoutWrapper({ children, heading, description, wrapperClassName, contentClassName, showHeading, showDescription, navbar, verticalCenter, }: StandaloneLayoutWrapperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=standalone_layout_wrapper.d.ts.map