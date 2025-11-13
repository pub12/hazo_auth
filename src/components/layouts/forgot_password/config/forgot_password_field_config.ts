// file_description: forgot password layout specific configuration helpers
// section: imports
import type { LayoutFieldMap, LayoutFieldMapOverrides } from "@/components/layouts/shared/config/layout_customization";
import {
  resolveButtonPalette,
  resolveFieldDefinitions,
  resolveLabels,
  type ButtonPaletteDefaults,
  type ButtonPaletteOverrides,
  type LayoutLabelDefaults,
  type LayoutLabelOverrides,
} from "@/components/layouts/shared/config/layout_customization";

// section: field_identifiers
export const FORGOT_PASSWORD_FIELD_IDS = {
  EMAIL: "email_address",
} as const;

export type ForgotPasswordFieldId = (typeof FORGOT_PASSWORD_FIELD_IDS)[keyof typeof FORGOT_PASSWORD_FIELD_IDS];

// section: field_definitions
const FORGOT_PASSWORD_FIELD_DEFINITIONS: LayoutFieldMap = {
  [FORGOT_PASSWORD_FIELD_IDS.EMAIL]: {
    id: FORGOT_PASSWORD_FIELD_IDS.EMAIL,
    label: "Email address",
    type: "email",
    autoComplete: "email",
    placeholder: "Enter your email address",
    ariaLabel: "Email address input field",
  },
};

export const createForgotPasswordFieldDefinitions = (
  overrides?: LayoutFieldMapOverrides,
) => resolveFieldDefinitions(FORGOT_PASSWORD_FIELD_DEFINITIONS, overrides);

// section: label_defaults
const FORGOT_PASSWORD_LABEL_DEFAULTS: LayoutLabelDefaults = {
  heading: "Forgot your password?",
  subHeading: "Enter your email address and we'll send you a link to reset your password.",
  submitButton: "Send reset link",
  cancelButton: "Cancel",
};

export const resolveForgotPasswordLabels = (overrides?: LayoutLabelOverrides) =>
  resolveLabels(FORGOT_PASSWORD_LABEL_DEFAULTS, overrides);

// section: button_palette_defaults
const FORGOT_PASSWORD_BUTTON_PALETTE_DEFAULTS: ButtonPaletteDefaults = {
  submitBackground: "#0f172a",
  submitText: "#ffffff",
  cancelBorder: "#cbd5f5",
  cancelText: "#0f172a",
};

export const resolveForgotPasswordButtonPalette = (overrides?: ButtonPaletteOverrides) =>
  resolveButtonPalette(FORGOT_PASSWORD_BUTTON_PALETTE_DEFAULTS, overrides);

