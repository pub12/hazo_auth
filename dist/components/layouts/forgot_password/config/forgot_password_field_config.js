import { resolveButtonPalette, resolveFieldDefinitions, resolveLabels, } from "../../shared/config/layout_customization.js";
// section: field_identifiers
export const FORGOT_PASSWORD_FIELD_IDS = {
    EMAIL: "email_address",
};
// section: field_definitions
const FORGOT_PASSWORD_FIELD_DEFINITIONS = {
    [FORGOT_PASSWORD_FIELD_IDS.EMAIL]: {
        id: FORGOT_PASSWORD_FIELD_IDS.EMAIL,
        label: "Email address",
        type: "email",
        autoComplete: "email",
        placeholder: "Enter your email address",
        ariaLabel: "Email address input field",
    },
};
export const createForgotPasswordFieldDefinitions = (overrides) => resolveFieldDefinitions(FORGOT_PASSWORD_FIELD_DEFINITIONS, overrides);
// section: label_defaults
const FORGOT_PASSWORD_LABEL_DEFAULTS = {
    heading: "Forgot your password?",
    subHeading: "Enter your email address and we'll send you a link to reset your password.",
    submitButton: "Send reset link",
    cancelButton: "Cancel",
};
export const resolveForgotPasswordLabels = (overrides) => resolveLabels(FORGOT_PASSWORD_LABEL_DEFAULTS, overrides);
// section: button_palette_defaults
const FORGOT_PASSWORD_BUTTON_PALETTE_DEFAULTS = {
    submitBackground: "#0f172a",
    submitText: "#ffffff",
    cancelBorder: "#cbd5f5",
    cancelText: "#0f172a",
};
export const resolveForgotPasswordButtonPalette = (overrides) => resolveButtonPalette(FORGOT_PASSWORD_BUTTON_PALETTE_DEFAULTS, overrides);
