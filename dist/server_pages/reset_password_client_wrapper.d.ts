import type { ResetPasswordConfig } from "../lib/reset_password_config.server";
import type { StaticImageData } from "next/image";
export type ResetPasswordClientWrapperProps = Omit<ResetPasswordConfig, 'imageSrc' | 'imageAlt' | 'imageBackgroundColor'> & {
    image_src: string | StaticImageData;
    image_alt: string;
    image_background_color: string;
};
/**
 * Client wrapper for ResetPasswordLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export declare function ResetPasswordClientWrapper({ image_src, image_alt, image_background_color, passwordRequirements, errorMessage, successMessage, loginPath, forgotPasswordPath, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, }: ResetPasswordClientWrapperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=reset_password_client_wrapper.d.ts.map