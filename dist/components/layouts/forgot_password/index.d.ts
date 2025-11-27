import { type ButtonPaletteOverrides, type LayoutFieldMapOverrides, type LayoutLabelOverrides } from "../shared/config/layout_customization";
import { type LayoutDataClient } from "../shared/data/layout_data_client";
export type ForgotPasswordLayoutProps<TClient = unknown> = {
    image_src: string;
    image_alt: string;
    image_background_color?: string;
    field_overrides?: LayoutFieldMapOverrides;
    labels?: LayoutLabelOverrides;
    button_colors?: ButtonPaletteOverrides;
    data_client: LayoutDataClient<TClient>;
    alreadyLoggedInMessage?: string;
    showLogoutButton?: boolean;
    showReturnHomeButton?: boolean;
    returnHomeButtonLabel?: string;
    returnHomePath?: string;
};
export default function forgot_password_layout<TClient>({ image_src, image_alt, image_background_color, field_overrides, labels, button_colors, data_client, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, }: ForgotPasswordLayoutProps<TClient>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map