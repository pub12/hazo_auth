import type { LoginConfig } from "../lib/login_config.server";
import type { StaticImageData } from "next/image";
export type LoginClientWrapperProps = Omit<LoginConfig, 'imageSrc' | 'imageAlt' | 'imageBackgroundColor'> & {
    image_src: string | StaticImageData;
    image_alt: string;
    image_background_color: string;
};
/**
 * Client wrapper for LoginLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export declare function LoginClientWrapper({ image_src, image_alt, image_background_color, redirectRoute, successMessage, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, forgotPasswordPath, forgotPasswordLabel, createAccountPath, createAccountLabel, }: LoginClientWrapperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=login_client_wrapper.d.ts.map