import { type ButtonPaletteOverrides, type LayoutFieldMapOverrides, type LayoutLabelOverrides, type PasswordRequirementOverrides } from "../shared/config/layout_customization.js";
import { type LayoutDataClient } from "../shared/data/layout_data_client.js";
import type { StaticImageData } from "next/image";
export type RegisterLayoutProps<TClient = unknown> = {
    image_src: string | StaticImageData;
    image_alt: string;
    image_background_color?: string;
    field_overrides?: LayoutFieldMapOverrides;
    labels?: LayoutLabelOverrides;
    button_colors?: ButtonPaletteOverrides;
    password_requirements?: PasswordRequirementOverrides;
    show_name_field?: boolean;
    data_client: LayoutDataClient<TClient>;
    alreadyLoggedInMessage?: string;
    showLogoutButton?: boolean;
    showReturnHomeButton?: boolean;
    returnHomeButtonLabel?: string;
    returnHomePath?: string;
    signInPath?: string;
    signInLabel?: string;
    urlOnLogon?: string;
};
export default function register_layout<TClient>({ image_src, image_alt, image_background_color, field_overrides, labels, button_colors, password_requirements, show_name_field, data_client, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, signInPath, signInLabel, urlOnLogon, }: RegisterLayoutProps<TClient>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map