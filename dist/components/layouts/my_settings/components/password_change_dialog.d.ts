import type { PasswordRequirementOptions } from "../../shared/config/layout_customization";
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
/**
 * Dialog component for changing password
 * Shows current password, new password, and confirm password fields
 * Validates password requirements and ensures passwords match
 * @param props - Component props including open state, onSave callback, password requirements
 * @returns Password change dialog component
 */
export declare function PasswordChangeDialog({ open, onOpenChange, onSave, passwordRequirements, buttonPalette, currentPasswordLabel, newPasswordLabel, confirmPasswordLabel, saveButtonLabel, cancelButtonLabel, }: PasswordChangeDialogProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=password_change_dialog.d.ts.map