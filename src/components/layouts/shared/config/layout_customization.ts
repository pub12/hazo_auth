// file_description: provide reusable configuration helpers for layout components
// section: imports
import type { PasswordRequirementOptions } from "../../../../lib/utils/password_validator";
export type { PasswordRequirementOptions };

// section: types
export type LayoutFieldId = string;

export type LayoutFieldDefinition = {
  id: LayoutFieldId;
  label: string;
  type: "text" | "email" | "password";
  autoComplete?: string;
  placeholder: string;
  ariaLabel: string;
};

export type LayoutFieldMap = Record<LayoutFieldId, LayoutFieldDefinition>;
export type LayoutFieldMapOverrides = Partial<Record<LayoutFieldId, Partial<LayoutFieldDefinition>>>;

export type LayoutLabelDefaults = {
  heading: string;
  subHeading: string;
  submitButton: string;
  cancelButton: string;
};

export type LayoutLabelOverrides = Partial<LayoutLabelDefaults>;

export type ButtonPaletteDefaults = {
  submitBackground: string;
  submitText: string;
  cancelBorder: string;
  cancelText: string;
};

export type ButtonPaletteOverrides = Partial<ButtonPaletteDefaults>;

export type PasswordRequirementOverrides = Partial<PasswordRequirementOptions>;

// section: helpers
export const resolveFieldDefinitions = (
  baseDefinitions: LayoutFieldMap,
  overrides?: LayoutFieldMapOverrides,
): LayoutFieldMap => {
  if (!overrides) {
    return baseDefinitions;
  }

  const merged: LayoutFieldMap = { ...baseDefinitions };

  Object.entries(overrides).forEach(([fieldId, definitionOverride]) => {
    if (!definitionOverride) {
      return;
    }

    const existing = merged[fieldId] ?? (definitionOverride as LayoutFieldDefinition);
    merged[fieldId] = {
      ...existing,
      ...definitionOverride,
      id: existing.id ?? (fieldId as LayoutFieldId),
    };
  });

  return merged;
};

export const resolveLabels = (
  defaults: LayoutLabelDefaults,
  overrides?: LayoutLabelOverrides,
): LayoutLabelDefaults => ({
  ...defaults,
  ...(overrides ?? {}),
});

export const resolveButtonPalette = (
  defaults: ButtonPaletteDefaults,
  overrides?: ButtonPaletteOverrides,
): ButtonPaletteDefaults => ({
  ...defaults,
  ...(overrides ?? {}),
});

export const resolvePasswordRequirements = (
  defaults: PasswordRequirementOptions,
  overrides?: PasswordRequirementOverrides,
): PasswordRequirementOptions => ({
  ...defaults,
  ...(overrides ?? {}),
});

