import type { ForgotPasswordConfig } from "../lib/forgot_password_config.server";
import type { StaticImageData } from "next/image";
export type ForgotPasswordClientWrapperProps = Omit<ForgotPasswordConfig, 'imageSrc' | 'imageAlt' | 'imageBackgroundColor'> & {
    image_src: string | StaticImageData;
    image_alt: string;
    image_background_color: string;
    sign_in_path: string;
    sign_in_label: string;
};
/**
 * Client wrapper for ForgotPasswordLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export declare function ForgotPasswordClientWrapper({ image_src, image_alt, image_background_color, sign_in_path, sign_in_label, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, }: ForgotPasswordClientWrapperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=forgot_password_client_wrapper.d.ts.map