import type { LoginConfig } from "../lib/login_config.server";
import type { OAuthLayoutConfig } from "../components/layouts/login/index";
import type { StaticImageData } from "next/image";
export type LoginClientWrapperProps = Omit<LoginConfig, 'imageSrc' | 'imageAlt' | 'imageBackgroundColor' | 'oauth' | 'showCreateAccountLink'> & {
    image_src: string | StaticImageData;
    image_alt: string;
    image_background_color: string;
    /** Show/hide "Create account" link (default: true) */
    showCreateAccountLink?: boolean;
    /** OAuth configuration */
    oauth?: OAuthLayoutConfig;
};
/**
 * Client wrapper for LoginLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export declare function LoginClientWrapper({ image_src, image_alt, image_background_color, redirectRoute, successMessage, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, forgotPasswordPath, forgotPasswordLabel, createAccountPath, createAccountLabel, showCreateAccountLink, oauth, }: LoginClientWrapperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=login_client_wrapper.d.ts.map