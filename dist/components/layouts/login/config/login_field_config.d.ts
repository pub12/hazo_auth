import type { LayoutFieldMap, LayoutFieldMapOverrides } from "../../shared/config/layout_customization";
import { type ButtonPaletteDefaults, type ButtonPaletteOverrides, type LayoutLabelDefaults, type LayoutLabelOverrides } from "../../shared/config/layout_customization.js";
export declare const LOGIN_FIELD_IDS: {
    readonly EMAIL: "email_address";
    readonly PASSWORD: "password";
};
export type LoginFieldId = (typeof LOGIN_FIELD_IDS)[keyof typeof LOGIN_FIELD_IDS];
export declare const createLoginFieldDefinitions: (overrides?: LayoutFieldMapOverrides) => LayoutFieldMap;
export declare const resolveLoginLabels: (overrides?: LayoutLabelOverrides) => LayoutLabelDefaults;
export declare const resolveLoginButtonPalette: (overrides?: ButtonPaletteOverrides) => ButtonPaletteDefaults;
//# sourceMappingURL=login_field_config.d.ts.map