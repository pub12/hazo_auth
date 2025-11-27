// file_description: dialog component for changing password with current/new/confirm password fields
// section: client_directive
"use client";

// section: imports
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { PasswordField } from "../../shared/components/password_field";
import { FormFieldWrapper } from "../../shared/components/form_field_wrapper";
import type { PasswordRequirementOptions } from "../../shared/config/layout_customization";

// section: types
export type ButtonPalette = {
  submitBackground: string;
  submitText: string;
  cancelBorder: string;
  cancelText: string;
};

export type PasswordChangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (currentPassword: string, newPassword: string) => Promise<void>;
  passwordRequirements: PasswordRequirementOptions;
  buttonPalette?: ButtonPalette;
  currentPasswordLabel?: string;
  newPasswordLabel?: string;
  confirmPasswordLabel?: string;
  saveButtonLabel?: string;
  cancelButtonLabel?: string;
};

// section: component
/**
 * Dialog component for changing password
 * Shows current password, new password, and confirm password fields
 * Validates password requirements and ensures passwords match
 * @param props - Component props including open state, onSave callback, password requirements
 * @returns Password change dialog component
 */
export function PasswordChangeDialog({
  open,
  onOpenChange,
  onSave,
  passwordRequirements,
  buttonPalette,
  currentPasswordLabel = "Current password",
  newPasswordLabel = "New password",
  confirmPasswordLabel = "Confirm new password",
  saveButtonLabel = "Save",
  cancelButtonLabel = "Cancel",
}: PasswordChangeDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string | string[];
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (!password || password.length < passwordRequirements.minimum_length) {
      return `Password must be at least ${passwordRequirements.minimum_length} characters long`;
    }

    const errors: string[] = [];

    if (passwordRequirements.require_uppercase && !/[A-Z]/.test(password)) {
      errors.push("uppercase letter");
    }

    if (passwordRequirements.require_lowercase && !/[a-z]/.test(password)) {
      errors.push("lowercase letter");
    }

    if (passwordRequirements.require_number && !/[0-9]/.test(password)) {
      errors.push("number");
    }

    if (passwordRequirements.require_special && !/[^A-Za-z0-9]/.test(password)) {
      errors.push("special character");
    }

    if (errors.length > 0) {
      return `Password must contain at least one: ${errors.join(", ")}`;
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      newErrors.newPassword = newPasswordError;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSave(currentPassword, newPassword);
      // Reset form on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      setErrors({ currentPassword: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    onOpenChange(false);
  };

  // Format password requirements for display
  const getPasswordRequirements = (): string[] => {
    const requirements: string[] = [];
    requirements.push(`At least ${passwordRequirements.minimum_length} characters`);
    if (passwordRequirements.require_uppercase) {
      requirements.push("One uppercase letter");
    }
    if (passwordRequirements.require_lowercase) {
      requirements.push("One lowercase letter");
    }
    if (passwordRequirements.require_number) {
      requirements.push("One number");
    }
    if (passwordRequirements.require_special) {
      requirements.push("One special character");
    }
    return requirements;
  };

  const passwordRequirementsList = getPasswordRequirements();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cls_password_change_dialog max-w-md">
        <DialogHeader className="cls_password_change_dialog_header">
          <DialogTitle className="cls_password_change_dialog_title">
            Change Password
          </DialogTitle>
          <DialogDescription className="cls_password_change_dialog_description">
            Enter your current password and choose a new password.
          </DialogDescription>
        </DialogHeader>
        <div className="cls_password_change_dialog_content flex flex-col gap-4 py-4">
          <FormFieldWrapper
            fieldId="current-password"
            label={currentPasswordLabel}
            input={
              <PasswordField
                inputId="current-password"
                ariaLabel={currentPasswordLabel}
                value={currentPassword}
                placeholder="Enter your current password"
                autoComplete="current-password"
                isVisible={currentPasswordVisible}
                onChange={(value) => {
                  setCurrentPassword(value);
                  if (errors.currentPassword) {
                    setErrors({ ...errors, currentPassword: undefined });
                  }
                }}
                onToggleVisibility={() => setCurrentPasswordVisible(!currentPasswordVisible)}
                errorMessage={errors.currentPassword}
              />
            }
          />
          <FormFieldWrapper
            fieldId="new-password"
            label={newPasswordLabel}
            input={
              <PasswordField
                inputId="new-password"
                ariaLabel={newPasswordLabel}
                value={newPassword}
                placeholder="Enter your new password"
                autoComplete="new-password"
                isVisible={newPasswordVisible}
                onChange={(value) => {
                  setNewPassword(value);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: undefined });
                  }
                }}
                onToggleVisibility={() => setNewPasswordVisible(!newPasswordVisible)}
                errorMessage={errors.newPassword}
              />
            }
          />
          {passwordRequirementsList.length > 0 && (
            <div className="cls_password_change_dialog_requirements text-xs text-[var(--hazo-text-muted)]">
              <p className="cls_password_change_dialog_requirements_label font-medium mb-1">
                Password requirements:
              </p>
              <ul className="cls_password_change_dialog_requirements_list list-disc list-inside space-y-0.5">
                {passwordRequirementsList.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          <FormFieldWrapper
            fieldId="confirm-password"
            label={confirmPasswordLabel}
            input={
              <PasswordField
                inputId="confirm-password"
                ariaLabel={confirmPasswordLabel}
                value={confirmPassword}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                isVisible={confirmPasswordVisible}
                onChange={(value) => {
                  setConfirmPassword(value);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined });
                  }
                }}
                onToggleVisibility={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                errorMessage={errors.confirmPassword}
              />
            }
          />
        </div>
        <div className="cls_password_change_dialog_actions flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="cls_password_change_dialog_save_button"
            style={buttonPalette ? {
              backgroundColor: buttonPalette.submitBackground,
              color: buttonPalette.submitText,
            } : undefined}
            aria-label={saveButtonLabel}
          >
            {saveButtonLabel}
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            variant="outline"
            className="cls_password_change_dialog_cancel_button"
            style={buttonPalette ? {
              borderColor: buttonPalette.cancelBorder,
              color: buttonPalette.cancelText,
            } : undefined}
            aria-label={cancelButtonLabel}
          >
            {cancelButtonLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

