import { type ButtonPaletteOverrides, type LayoutFieldMapOverrides, type LayoutLabelOverrides, type PasswordRequirementOverrides } from "../shared/config/layout_customization";
import { type LayoutDataClient } from "../shared/data/layout_data_client";
export type ResetPasswordLayoutProps<TClient = unknown> = {
    image_src: string;
    image_alt: string;
    image_background_color?: string;
    field_overrides?: LayoutFieldMapOverrides;
    labels?: LayoutLabelOverrides;
    button_colors?: ButtonPaletteOverrides;
    password_requirements?: PasswordRequirementOverrides;
    data_client: LayoutDataClient<TClient>;
    alreadyLoggedInMessage?: string;
    showLogoutButton?: boolean;
    showReturnHomeButton?: boolean;
    returnHomeButtonLabel?: string;
    returnHomePath?: string;
    errorMessage?: string;
    successMessage?: string;
    loginPath?: string;
    forgotPasswordPath?: string;
};
export default function reset_password_layout<TClient>({ image_src, image_alt, image_background_color, field_overrides, labels, button_colors, password_requirements, data_client, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, errorMessage, successMessage, loginPath, forgotPasswordPath, }: ResetPasswordLayoutProps<TClient>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map