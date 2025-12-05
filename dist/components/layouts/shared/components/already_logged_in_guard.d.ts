import type { StaticImageData } from "next/image";
export type AlreadyLoggedInGuardProps = {
    image_src: string | StaticImageData;
    image_alt: string;
    image_background_color?: string;
    message?: string;
    showLogoutButton?: boolean;
    showReturnHomeButton?: boolean;
    returnHomeButtonLabel?: string;
    returnHomePath?: string;
    requireEmailVerified?: boolean;
    children: React.ReactNode;
};
/**
 * Guard component that shows "already logged in" message if user is authenticated
 * Otherwise renders children
 * @param props - Component props including layout config and message customization
 * @returns Either the "already logged in" UI or the children
 */
export declare function AlreadyLoggedInGuard({ image_src, image_alt, image_background_color, message, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, requireEmailVerified, children, }: AlreadyLoggedInGuardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=already_logged_in_guard.d.ts.map