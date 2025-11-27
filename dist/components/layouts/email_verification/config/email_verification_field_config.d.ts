import type { LayoutFieldMap, LayoutFieldMapOverrides } from "../../shared/config/layout_customization";
import { type ButtonPaletteDefaults, type ButtonPaletteOverrides, type LayoutLabelDefaults, type LayoutLabelOverrides } from "../../shared/config/layout_customization";
export declare const EMAIL_VERIFICATION_FIELD_IDS: {
    readonly EMAIL: "email_address";
};
export type EmailVerificationFieldId = (typeof EMAIL_VERIFICATION_FIELD_IDS)[keyof typeof EMAIL_VERIFICATION_FIELD_IDS];
export declare const createEmailVerificationFieldDefinitions: (overrides?: LayoutFieldMapOverrides) => LayoutFieldMap;
export declare const resolveEmailVerificationLabels: (overrides?: LayoutLabelOverrides) => LayoutLabelDefaults;
export declare const resolveEmailVerificationButtonPalette: (overrides?: ButtonPaletteOverrides) => ButtonPaletteDefaults;
export type EmailVerificationSuccessLabels = {
    heading: string;
    message: string;
    redirectMessage: string;
    goToLoginButton: string;
};
export declare const EMAIL_VERIFICATION_SUCCESS_LABEL_DEFAULTS: EmailVerificationSuccessLabels;
export type EmailVerificationErrorLabels = {
    heading: string;
    message: string;
    resendFormHeading: string;
};
export declare const EMAIL_VERIFICATION_ERROR_LABEL_DEFAULTS: EmailVerificationErrorLabels;
//# sourceMappingURL=email_verification_field_config.d.ts.map