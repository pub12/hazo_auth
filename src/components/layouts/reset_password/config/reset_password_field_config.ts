// file_description: reset password layout specific configuration helpers
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
  type PasswordRequirementOptions,
  type PasswordRequirementOverrides,
  resolvePasswordRequirements,
} from "@/components/layouts/shared/config/layout_customization";

// section: field_identifiers
export const RESET_PASSWORD_FIELD_IDS = {
  PASSWORD: "password",
  CONFIRM_PASSWORD: "confirm_password",
} as const;

export type ResetPasswordFieldId = (typeof RESET_PASSWORD_FIELD_IDS)[keyof typeof RESET_PASSWORD_FIELD_IDS];

// section: field_definitions
const RESET_PASSWORD_FIELD_DEFINITIONS: LayoutFieldMap = {
  [RESET_PASSWORD_FIELD_IDS.PASSWORD]: {
    id: RESET_PASSWORD_FIELD_IDS.PASSWORD,
    label: "New password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Enter your new password",
    ariaLabel: "New password input field",
  },
  [RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]: {
    id: RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD,
    label: "Confirm new password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Re-enter your new password",
    ariaLabel: "Confirm new password input field",
  },
};

export const createResetPasswordFieldDefinitions = (
  overrides?: LayoutFieldMapOverrides,
) => resolveFieldDefinitions(RESET_PASSWORD_FIELD_DEFINITIONS, overrides);

// section: label_defaults
const RESET_PASSWORD_LABEL_DEFAULTS: LayoutLabelDefaults = {
  heading: "Reset your password",
  subHeading: "Enter your new password below.",
  submitButton: "Reset password",
  cancelButton: "Cancel",
};

export const resolveResetPasswordLabels = (overrides?: LayoutLabelOverrides) =>
  resolveLabels(RESET_PASSWORD_LABEL_DEFAULTS, overrides);

// section: button_palette_defaults
const RESET_PASSWORD_BUTTON_PALETTE_DEFAULTS: ButtonPaletteDefaults = {
  submitBackground: "#0f172a",
  submitText: "#ffffff",
  cancelBorder: "#cbd5f5",
  cancelText: "#0f172a",
};

export const resolveResetPasswordButtonPalette = (overrides?: ButtonPaletteOverrides) =>
  resolveButtonPalette(RESET_PASSWORD_BUTTON_PALETTE_DEFAULTS, overrides);

// section: password_requirements_defaults
const RESET_PASSWORD_PASSWORD_REQUIREMENT_DEFAULTS: PasswordRequirementOptions = {
  minimum_length: 8,
  require_uppercase: false,
  require_lowercase: false,
  require_number: false,
  require_special: false,
};

export const resolveResetPasswordPasswordRequirements = (
  overrides?: PasswordRequirementOverrides,
) => resolvePasswordRequirements(RESET_PASSWORD_PASSWORD_REQUIREMENT_DEFAULTS, overrides);

// section: already_logged_in_label
export const RESET_PASSWORD_ALREADY_LOGGED_IN_MESSAGE_DEFAULT = "You're already logged in.";

