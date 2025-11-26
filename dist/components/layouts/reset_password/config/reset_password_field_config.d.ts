import type { LayoutFieldMap, LayoutFieldMapOverrides } from "hazo_auth/components/layouts/shared/config/layout_customization";
import { type ButtonPaletteDefaults, type ButtonPaletteOverrides, type LayoutLabelDefaults, type LayoutLabelOverrides, type PasswordRequirementOptions, type PasswordRequirementOverrides } from "hazo_auth/components/layouts/shared/config/layout_customization";
export declare const RESET_PASSWORD_FIELD_IDS: {
    readonly PASSWORD: "password";
    readonly CONFIRM_PASSWORD: "confirm_password";
};
export type ResetPasswordFieldId = (typeof RESET_PASSWORD_FIELD_IDS)[keyof typeof RESET_PASSWORD_FIELD_IDS];
export declare const createResetPasswordFieldDefinitions: (overrides?: LayoutFieldMapOverrides) => LayoutFieldMap;
export declare const resolveResetPasswordLabels: (overrides?: LayoutLabelOverrides) => LayoutLabelDefaults;
export declare const resolveResetPasswordButtonPalette: (overrides?: ButtonPaletteOverrides) => ButtonPaletteDefaults;
export declare const resolveResetPasswordPasswordRequirements: (overrides?: PasswordRequirementOverrides) => PasswordRequirementOptions;
export declare const RESET_PASSWORD_ALREADY_LOGGED_IN_MESSAGE_DEFAULT = "You're already logged in.";
//# sourceMappingURL=reset_password_field_config.d.ts.map