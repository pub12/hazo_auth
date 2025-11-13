// file_description: my settings layout specific configuration helpers
// section: imports
import type { LayoutFieldMap } from "@/components/layouts/shared/config/layout_customization";
import {
  resolveButtonPalette,
  type ButtonPaletteDefaults,
  type ButtonPaletteOverrides,
  type PasswordRequirementOptions,
} from "@/components/layouts/shared/config/layout_customization";

// section: field_identifiers
export const MY_SETTINGS_FIELD_IDS = {
  NAME: "name",
  EMAIL: "email_address",
  PASSWORD: "password",
} as const;

export type MySettingsFieldId = (typeof MY_SETTINGS_FIELD_IDS)[keyof typeof MY_SETTINGS_FIELD_IDS];

// section: label_defaults
export type MySettingsLabelDefaults = {
  heading: string;
  profileTab: string;
  securityTab: string;
  lastLoggedInLabel: string;
  profilePictureLabel: string;
  changePasswordButton: string;
};

const MY_SETTINGS_LABEL_DEFAULTS: MySettingsLabelDefaults = {
  heading: "My Settings",
  profileTab: "Profile",
  securityTab: "Security",
  lastLoggedInLabel: "Last logged in",
  profilePictureLabel: "Profile Picture",
  changePasswordButton: "Change Password",
};

export type MySettingsLabelOverrides = Partial<MySettingsLabelDefaults>;

export const resolveMySettingsLabels = (
  overrides?: MySettingsLabelOverrides,
): MySettingsLabelDefaults => {
  return {
    ...MY_SETTINGS_LABEL_DEFAULTS,
    ...overrides,
  };
};

// section: button_palette_defaults
const MY_SETTINGS_BUTTON_PALETTE_DEFAULTS: ButtonPaletteDefaults = {
  submitBackground: "#0f172a",
  submitText: "#ffffff",
  cancelBorder: "#cbd5f5",
  cancelText: "#0f172a",
};

export const resolveMySettingsButtonPalette = (
  overrides?: ButtonPaletteOverrides,
) => resolveButtonPalette(MY_SETTINGS_BUTTON_PALETTE_DEFAULTS, overrides);

