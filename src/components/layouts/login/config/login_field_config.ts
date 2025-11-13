// file_description: login layout specific configuration helpers
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
export const LOGIN_FIELD_IDS = {
  EMAIL: "email_address",
  PASSWORD: "password",
} as const;

export type LoginFieldId = (typeof LOGIN_FIELD_IDS)[keyof typeof LOGIN_FIELD_IDS];

// section: field_definitions
const LOGIN_FIELD_DEFINITIONS: LayoutFieldMap = {
  [LOGIN_FIELD_IDS.EMAIL]: {
    id: LOGIN_FIELD_IDS.EMAIL,
    label: "Email address",
    type: "email",
    autoComplete: "email",
    placeholder: "Enter your email address",
    ariaLabel: "Email address input field",
  },
  [LOGIN_FIELD_IDS.PASSWORD]: {
    id: LOGIN_FIELD_IDS.PASSWORD,
    label: "Password",
    type: "password",
    autoComplete: "current-password",
    placeholder: "Enter your password",
    ariaLabel: "Password input field",
  },
};

export const createLoginFieldDefinitions = (
  overrides?: LayoutFieldMapOverrides,
) => resolveFieldDefinitions(LOGIN_FIELD_DEFINITIONS, overrides);

// section: label_defaults
const LOGIN_LABEL_DEFAULTS: LayoutLabelDefaults = {
  heading: "Sign in to your account",
  subHeading: "Enter your credentials to access your secure workspace.",
  submitButton: "Login",
  cancelButton: "Cancel",
};

export const resolveLoginLabels = (overrides?: LayoutLabelOverrides) =>
  resolveLabels(LOGIN_LABEL_DEFAULTS, overrides);

// section: button_palette_defaults
const LOGIN_BUTTON_PALETTE_DEFAULTS: ButtonPaletteDefaults = {
  submitBackground: "#0f172a",
  submitText: "#ffffff",
  cancelBorder: "#cbd5f5",
  cancelText: "#0f172a",
};

export const resolveLoginButtonPalette = (overrides?: ButtonPaletteOverrides) =>
  resolveButtonPalette(LOGIN_BUTTON_PALETTE_DEFAULTS, overrides);

