import type { PasswordRequirementOptions } from "../../../../lib/utils/password_validator";
export type { PasswordRequirementOptions };
export type LayoutFieldId = string;
export type LayoutFieldDefinition = {
    id: LayoutFieldId;
    label: string;
    type: "text" | "email" | "password";
    autoComplete?: string;
    placeholder: string;
    ariaLabel: string;
};
export type LayoutFieldMap = Record<LayoutFieldId, LayoutFieldDefinition>;
export type LayoutFieldMapOverrides = Partial<Record<LayoutFieldId, Partial<LayoutFieldDefinition>>>;
export type LayoutLabelDefaults = {
    heading: string;
    subHeading: string;
    submitButton: string;
    cancelButton: string;
};
export type LayoutLabelOverrides = Partial<LayoutLabelDefaults>;
export type ButtonPaletteDefaults = {
    submitBackground: string;
    submitText: string;
    cancelBorder: string;
    cancelText: string;
};
export type ButtonPaletteOverrides = Partial<ButtonPaletteDefaults>;
export type PasswordRequirementOverrides = Partial<PasswordRequirementOptions>;
export declare const resolveFieldDefinitions: (baseDefinitions: LayoutFieldMap, overrides?: LayoutFieldMapOverrides) => LayoutFieldMap;
export declare const resolveLabels: (defaults: LayoutLabelDefaults, overrides?: LayoutLabelOverrides) => LayoutLabelDefaults;
export declare const resolveButtonPalette: (defaults: ButtonPaletteDefaults, overrides?: ButtonPaletteOverrides) => ButtonPaletteDefaults;
export declare const resolvePasswordRequirements: (defaults: PasswordRequirementOptions, overrides?: PasswordRequirementOverrides) => PasswordRequirementOptions;
//# sourceMappingURL=layout_customization.d.ts.map