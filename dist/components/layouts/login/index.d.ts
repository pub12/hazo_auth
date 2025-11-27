import { type ButtonPaletteOverrides, type LayoutFieldMapOverrides, type LayoutLabelOverrides } from "../shared/config/layout_customization";
import { type LayoutDataClient } from "../shared/data/layout_data_client";
export type LoginLayoutProps<TClient = unknown> = {
    image_src: string;
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
};
export default function login_layout<TClient>({ image_src, image_alt, image_background_color, field_overrides, labels, button_colors, data_client, logger, redirectRoute, successMessage, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, forgot_password_path, forgot_password_label, create_account_path, create_account_label, urlOnLogon, }: LoginLayoutProps<TClient>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map