import type { StaticImageData } from "next/image";
import { type ButtonPaletteOverrides, type LayoutFieldMapOverrides, type LayoutLabelOverrides } from "../shared/config/layout_customization";
import { type LayoutDataClient } from "../shared/data/layout_data_client";
export type ForgotPasswordLayoutProps<TClient = unknown> = {
    image_src: string | StaticImageData;
    image_alt: string;
    image_background_color?: string;
    field_overrides?: LayoutFieldMapOverrides;
    labels?: LayoutLabelOverrides;
    button_colors?: ButtonPaletteOverrides;
    data_client: LayoutDataClient<TClient>;
    sign_in_path?: string;
    sign_in_label?: string;
    alreadyLoggedInMessage?: string;
    showLogoutButton?: boolean;
    showReturnHomeButton?: boolean;
    returnHomeButtonLabel?: string;
    returnHomePath?: string;
};
export default function forgot_password_layout<TClient>({ image_src, image_alt, image_background_color, field_overrides, labels, button_colors, data_client, sign_in_path, sign_in_label, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, }: ForgotPasswordLayoutProps<TClient>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map