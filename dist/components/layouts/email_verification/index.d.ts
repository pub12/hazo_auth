import type { StaticImageData } from "next/image";
import { type ButtonPaletteOverrides, type LayoutFieldMapOverrides, type LayoutLabelOverrides } from "../shared/config/layout_customization.js";
import { type EmailVerificationSuccessLabels, type EmailVerificationErrorLabels } from "./config/email_verification_field_config.js";
import { type LayoutDataClient } from "../shared/data/layout_data_client.js";
export type EmailVerificationLayoutProps<TClient = unknown> = {
    image_src: string | StaticImageData;
    image_alt: string;
    image_background_color?: string;
    field_overrides?: LayoutFieldMapOverrides;
    labels?: LayoutLabelOverrides;
    button_colors?: ButtonPaletteOverrides;
    success_labels?: Partial<EmailVerificationSuccessLabels>;
    error_labels?: Partial<EmailVerificationErrorLabels>;
    redirect_delay?: number;
    login_path?: string;
    sign_in_label?: string;
    already_logged_in_message?: string;
    showLogoutButton?: boolean;
    showReturnHomeButton?: boolean;
    returnHomeButtonLabel?: string;
    returnHomePath?: string;
    data_client: LayoutDataClient<TClient>;
};
export default function email_verification_layout<TClient>({ image_src, image_alt, image_background_color, field_overrides, labels, button_colors, success_labels, error_labels, redirect_delay, login_path, sign_in_label, data_client, already_logged_in_message, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, }: EmailVerificationLayoutProps<TClient>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map