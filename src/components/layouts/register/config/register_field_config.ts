// file_description: register layout specific configuration helpers
// section: imports
import type { LayoutFieldMap, LayoutFieldMapOverrides } from "../../shared/config/layout_customization";
import {
  resolveButtonPalette,
  resolveFieldDefinitions,
  resolveLabels,
  resolvePasswordRequirements,
  type ButtonPaletteDefaults,
  type ButtonPaletteOverrides,
  type LayoutLabelDefaults,
  type LayoutLabelOverrides,
  type PasswordRequirementOptions,
  type PasswordRequirementOverrides,
} from "../../shared/config/layout_customization";

// section: field_identifiers
export const REGISTER_FIELD_IDS = {
  NAME: "name",
  EMAIL: "email_address",
  PASSWORD: "password",
  CONFIRM_PASSWORD: "confirm_password",
} as const;

export type RegisterFieldId = (typeof REGISTER_FIELD_IDS)[keyof typeof REGISTER_FIELD_IDS];

// section: field_definitions
const REGISTER_FIELD_DEFINITIONS: LayoutFieldMap = {
  [REGISTER_FIELD_IDS.NAME]: {
    id: REGISTER_FIELD_IDS.NAME,
    label: "Full name",
    type: "text",
    autoComplete: "name",
    placeholder: "Enter your full name",
    ariaLabel: "Full name input field",
  },
  [REGISTER_FIELD_IDS.EMAIL]: {
    id: REGISTER_FIELD_IDS.EMAIL,
    label: "Email address",
    type: "email",
    autoComplete: "email",
    placeholder: "Enter your email address",
    ariaLabel: "Email address input field",
  },
  [REGISTER_FIELD_IDS.PASSWORD]: {
    id: REGISTER_FIELD_IDS.PASSWORD,
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Enter your password",
    ariaLabel: "Password input field",
  },
  [REGISTER_FIELD_IDS.CONFIRM_PASSWORD]: {
    id: REGISTER_FIELD_IDS.CONFIRM_PASSWORD,
    label: "Re-enter password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Re-enter your password",
    ariaLabel: "Re-enter password input field",
  },
};

export const createRegisterFieldDefinitions = (
  overrides?: LayoutFieldMapOverrides,
) => resolveFieldDefinitions(REGISTER_FIELD_DEFINITIONS, overrides);

// section: label_defaults
const REGISTER_LABEL_DEFAULTS: LayoutLabelDefaults = {
  heading: "Create your hazo account",
  subHeading: "Secure your access with editable fields powered by shadcn components.",
  submitButton: "Register",
  cancelButton: "Cancel",
};

export const resolveRegisterLabels = (overrides?: LayoutLabelOverrides) =>
  resolveLabels(REGISTER_LABEL_DEFAULTS, overrides);

// section: button_palette_defaults
const REGISTER_BUTTON_PALETTE_DEFAULTS: ButtonPaletteDefaults = {
  submitBackground: "#0f172a",
  submitText: "#ffffff",
  cancelBorder: "#cbd5f5",
  cancelText: "#0f172a",
};

export const resolveRegisterButtonPalette = (overrides?: ButtonPaletteOverrides) =>
  resolveButtonPalette(REGISTER_BUTTON_PALETTE_DEFAULTS, overrides);

// section: password_rules
const REGISTER_PASSWORD_REQUIREMENTS: PasswordRequirementOptions = {
  minimum_length: 8,
  require_uppercase: true,
  require_lowercase: true,
  require_number: true,
  require_special: true,
};

export const resolveRegisterPasswordRequirements = (
  overrides?: PasswordRequirementOverrides,
) => resolvePasswordRequirements(REGISTER_PASSWORD_REQUIREMENTS, overrides);

