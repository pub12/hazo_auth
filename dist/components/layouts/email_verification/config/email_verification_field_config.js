import { resolveButtonPalette, resolveFieldDefinitions, resolveLabels, } from "../../shared/config/layout_customization.js";
// section: field_identifiers
export const EMAIL_VERIFICATION_FIELD_IDS = {
    EMAIL: "email_address",
};
// section: field_definitions
const EMAIL_VERIFICATION_FIELD_DEFINITIONS = {
    [EMAIL_VERIFICATION_FIELD_IDS.EMAIL]: {
        id: EMAIL_VERIFICATION_FIELD_IDS.EMAIL,
        label: "Email address",
        type: "email",
        autoComplete: "email",
        placeholder: "Enter your email address",
        ariaLabel: "Email address input field",
    },
};
export const createEmailVerificationFieldDefinitions = (overrides) => resolveFieldDefinitions(EMAIL_VERIFICATION_FIELD_DEFINITIONS, overrides);
// section: label_defaults
const EMAIL_VERIFICATION_LABEL_DEFAULTS = {
    heading: "Email verification",
    subHeading: "Verifying your email address...",
    submitButton: "Resend verification email",
    cancelButton: "Cancel",
};
export const resolveEmailVerificationLabels = (overrides) => resolveLabels(EMAIL_VERIFICATION_LABEL_DEFAULTS, overrides);
// section: button_palette_defaults
const EMAIL_VERIFICATION_BUTTON_PALETTE_DEFAULTS = {
    submitBackground: "#0f172a",
    submitText: "#ffffff",
    cancelBorder: "#cbd5f5",
    cancelText: "#0f172a",
};
export const resolveEmailVerificationButtonPalette = (overrides) => resolveButtonPalette(EMAIL_VERIFICATION_BUTTON_PALETTE_DEFAULTS, overrides);
export const EMAIL_VERIFICATION_SUCCESS_LABEL_DEFAULTS = {
    heading: "Email verified successfully",
    message: "Your email address has been verified. You can now log in to your account.",
    redirectMessage: "Redirecting to login page in",
    goToLoginButton: "Go to login",
};
export const EMAIL_VERIFICATION_ERROR_LABEL_DEFAULTS = {
    heading: "Verification failed",
    message: "The verification link is invalid or has expired.",
    resendFormHeading: "Resend verification email",
};
