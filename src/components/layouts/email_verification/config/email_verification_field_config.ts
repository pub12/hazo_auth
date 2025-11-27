// file_description: email verification layout specific configuration helpers
// section: imports
import type { LayoutFieldMap, LayoutFieldMapOverrides } from "../../shared/config/layout_customization";
import {
  resolveButtonPalette,
  resolveFieldDefinitions,
  resolveLabels,
  type ButtonPaletteDefaults,
  type ButtonPaletteOverrides,
  type LayoutLabelDefaults,
  type LayoutLabelOverrides,
} from "../../shared/config/layout_customization";

// section: field_identifiers
export const EMAIL_VERIFICATION_FIELD_IDS = {
  EMAIL: "email_address",
} as const;

export type EmailVerificationFieldId = (typeof EMAIL_VERIFICATION_FIELD_IDS)[keyof typeof EMAIL_VERIFICATION_FIELD_IDS];

// section: field_definitions
const EMAIL_VERIFICATION_FIELD_DEFINITIONS: LayoutFieldMap = {
  [EMAIL_VERIFICATION_FIELD_IDS.EMAIL]: {
    id: EMAIL_VERIFICATION_FIELD_IDS.EMAIL,
    label: "Email address",
    type: "email",
    autoComplete: "email",
    placeholder: "Enter your email address",
    ariaLabel: "Email address input field",
  },
};

export const createEmailVerificationFieldDefinitions = (
  overrides?: LayoutFieldMapOverrides,
) => resolveFieldDefinitions(EMAIL_VERIFICATION_FIELD_DEFINITIONS, overrides);

// section: label_defaults
const EMAIL_VERIFICATION_LABEL_DEFAULTS: LayoutLabelDefaults = {
  heading: "Email verification",
  subHeading: "Verifying your email address...",
  submitButton: "Resend verification email",
  cancelButton: "Cancel",
};

export const resolveEmailVerificationLabels = (overrides?: LayoutLabelOverrides) =>
  resolveLabels(EMAIL_VERIFICATION_LABEL_DEFAULTS, overrides);

// section: button_palette_defaults
const EMAIL_VERIFICATION_BUTTON_PALETTE_DEFAULTS: ButtonPaletteDefaults = {
  submitBackground: "#0f172a",
  submitText: "#ffffff",
  cancelBorder: "#cbd5f5",
  cancelText: "#0f172a",
};

export const resolveEmailVerificationButtonPalette = (overrides?: ButtonPaletteOverrides) =>
  resolveButtonPalette(EMAIL_VERIFICATION_BUTTON_PALETTE_DEFAULTS, overrides);

// section: success_labels
export type EmailVerificationSuccessLabels = {
  heading: string;
  message: string;
  redirectMessage: string;
  goToLoginButton: string;
};

export const EMAIL_VERIFICATION_SUCCESS_LABEL_DEFAULTS: EmailVerificationSuccessLabels = {
  heading: "Email verified successfully",
  message: "Your email address has been verified. You can now log in to your account.",
  redirectMessage: "Redirecting to login page in",
  goToLoginButton: "Go to login",
};

// section: error_labels
export type EmailVerificationErrorLabels = {
  heading: string;
  message: string;
  resendFormHeading: string;
};

export const EMAIL_VERIFICATION_ERROR_LABEL_DEFAULTS: EmailVerificationErrorLabels = {
  heading: "Verification failed",
  message: "The verification link is invalid or has expired.",
  resendFormHeading: "Resend verification email",
};

