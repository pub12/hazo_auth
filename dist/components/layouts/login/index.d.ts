import type { StaticImageData } from "next/image";
import { type ButtonPaletteOverrides, type LayoutFieldMapOverrides, type LayoutLabelOverrides } from "../shared/config/layout_customization";
import { type LayoutDataClient } from "../shared/data/layout_data_client";
export type OAuthLayoutConfig = {
    /** Enable Google OAuth login */
    enable_google: boolean;
    /** Enable traditional email/password login */
    enable_email_password: boolean;
    /** Text displayed on the Google sign-in button */
    google_button_text: string;
    /** Text displayed on the divider between OAuth and email/password form */
    oauth_divider_text: string;
};
export type LoginLayoutProps<TClient = unknown> = {
    image_src: string | StaticImageData;
    image_alt: string;
    image_background_color?: string;
    field_overrides?: LayoutFieldMapOverrides;
    labels?: LayoutLabelOverrides;
    button_colors?: ButtonPaletteOverrides;
    data_client: LayoutDataClient<TClient>;
    logger?: {
        info: (message: string, data?: Record<string, unknown>) => void;
        error: (message: string, data?: Record<string, unknown>) => void;
        warn: (message: string, data?: Record<string, unknown>) => void;
        debug: (message: string, data?: Record<string, unknown>) => void;
    };
    redirectRoute?: string;
    successMessage?: string;
    alreadyLoggedInMessage?: string;
    showLogoutButton?: boolean;
    showReturnHomeButton?: boolean;
    returnHomeButtonLabel?: string;
    returnHomePath?: string;
    forgot_password_path?: string;
    forgot_password_label?: string;
    create_account_path?: string;
    create_account_label?: string;
    urlOnLogon?: string;
    /** OAuth configuration */
    oauth?: OAuthLayoutConfig;
};
export default function login_layout<TClient>({ image_src, image_alt, image_background_color, field_overrides, labels, button_colors, data_client, logger, redirectRoute, successMessage, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, forgot_password_path, forgot_password_label, create_account_path, create_account_label, urlOnLogon, oauth, }: LoginLayoutProps<TClient>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map