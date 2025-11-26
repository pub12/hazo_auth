import type { LayoutFieldMap, LayoutFieldMapOverrides } from "hazo_auth/components/layouts/shared/config/layout_customization";
import { type ButtonPaletteDefaults, type ButtonPaletteOverrides, type LayoutLabelDefaults, type LayoutLabelOverrides, type PasswordRequirementOptions, type PasswordRequirementOverrides } from "hazo_auth/components/layouts/shared/config/layout_customization";
export declare const REGISTER_FIELD_IDS: {
    readonly NAME: "name";
    readonly EMAIL: "email_address";
    readonly PASSWORD: "password";
    readonly CONFIRM_PASSWORD: "confirm_password";
};
export type RegisterFieldId = (typeof REGISTER_FIELD_IDS)[keyof typeof REGISTER_FIELD_IDS];
export declare const createRegisterFieldDefinitions: (overrides?: LayoutFieldMapOverrides) => LayoutFieldMap;
export declare const resolveRegisterLabels: (overrides?: LayoutLabelOverrides) => LayoutLabelDefaults;
export declare const resolveRegisterButtonPalette: (overrides?: ButtonPaletteOverrides) => ButtonPaletteDefaults;
export declare const resolveRegisterPasswordRequirements: (overrides?: PasswordRequirementOverrides) => PasswordRequirementOptions;
//# sourceMappingURL=register_field_config.d.ts.map