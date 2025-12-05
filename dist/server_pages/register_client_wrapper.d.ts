import type { RegisterConfig } from "../lib/register_config.server";
import type { StaticImageData } from "next/image";
export type RegisterClientWrapperProps = Omit<RegisterConfig, 'imageSrc' | 'imageAlt' | 'imageBackgroundColor'> & {
    image_src: string | StaticImageData;
    image_alt: string;
    image_background_color: string;
};
/**
 * Client wrapper for RegisterLayout
 * Initializes hazo_connect data client on client side and passes config from server
 */
export declare function RegisterClientWrapper({ image_src, image_alt, image_background_color, showNameField, passwordRequirements, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, signInPath, signInLabel, }: RegisterClientWrapperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=register_client_wrapper.d.ts.map