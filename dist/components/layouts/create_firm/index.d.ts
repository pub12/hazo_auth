import type { StaticImageData } from "next/image";
import { type ButtonPaletteOverrides } from "../shared/config/layout_customization.js";
export type CreateFirmLayoutProps = {
    /** Image source for the left panel */
    image_src: string | StaticImageData;
    /** Alt text for the image */
    image_alt?: string;
    /** Background color for the image panel */
    image_background_color?: string;
    /** Page heading */
    heading?: string;
    /** Page sub-heading */
    sub_heading?: string;
    /** Label for firm name field */
    firm_name_label?: string;
    /** Placeholder for firm name field */
    firm_name_placeholder?: string;
    /** Label for org structure field */
    org_structure_label?: string;
    /** Placeholder for org structure field */
    org_structure_placeholder?: string;
    /** Default value for org structure */
    default_org_structure?: string;
    /** Label for submit button */
    submit_button_label?: string;
    /** Success message shown after firm creation */
    success_message?: string;
    /** Route to redirect after success */
    redirect_route?: string;
    /** API base path for hazo_auth endpoints */
    apiBasePath?: string;
    /** Callback when firm is successfully created */
    onSuccess?: (scope_id: string) => void;
    /** Button color overrides */
    button_colors?: ButtonPaletteOverrides;
    /** Logger for debugging */
    logger?: {
        info: (message: string, data?: Record<string, unknown>) => void;
        error: (message: string, data?: Record<string, unknown>) => void;
    };
};
export default function CreateFirmLayout({ image_src, image_alt, image_background_color, heading, sub_heading, firm_name_label, firm_name_placeholder, org_structure_label, org_structure_placeholder, default_org_structure, submit_button_label, success_message, redirect_route, apiBasePath, onSuccess, button_colors, logger, }: CreateFirmLayoutProps): import("react/jsx-runtime").JSX.Element;
export { CreateFirmLayout };
//# sourceMappingURL=index.d.ts.map