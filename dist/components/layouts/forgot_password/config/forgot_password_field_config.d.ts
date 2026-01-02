import type { LayoutFieldMap, LayoutFieldMapOverrides } from "../../shared/config/layout_customization";
import { type ButtonPaletteDefaults, type ButtonPaletteOverrides, type LayoutLabelDefaults, type LayoutLabelOverrides } from "../../shared/config/layout_customization.js";
export declare const FORGOT_PASSWORD_FIELD_IDS: {
    readonly EMAIL: "email_address";
};
export type ForgotPasswordFieldId = (typeof FORGOT_PASSWORD_FIELD_IDS)[keyof typeof FORGOT_PASSWORD_FIELD_IDS];
export declare const createForgotPasswordFieldDefinitions: (overrides?: LayoutFieldMapOverrides) => LayoutFieldMap;
export declare const resolveForgotPasswordLabels: (overrides?: LayoutLabelOverrides) => LayoutLabelDefaults;
export declare const resolveForgotPasswordButtonPalette: (overrides?: ButtonPaletteOverrides) => ButtonPaletteDefaults;
//# sourceMappingURL=forgot_password_field_config.d.ts.map