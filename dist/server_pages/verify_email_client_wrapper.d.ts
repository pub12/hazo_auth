import type { EmailVerificationConfig } from "../lib/email_verification_config.server";
import type { StaticImageData } from "next/image";
export type VerifyEmailClientWrapperProps = Omit<EmailVerificationConfig, 'imageSrc' | 'imageAlt' | 'imageBackgroundColor'> & {
    image_src: string | StaticImageData;
    image_alt: string;
    image_background_color: string;
    redirect_delay: number;
    login_path: string;
};
/**
 * Client wrapper for EmailVerificationLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export declare function VerifyEmailClientWrapper({ image_src, image_alt, image_background_color, redirect_delay, login_path, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, }: VerifyEmailClientWrapperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=verify_email_client_wrapper.d.ts.map